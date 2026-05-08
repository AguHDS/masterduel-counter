import { PrismaClient } from "@prisma/client";
import { RankingRepository } from "@/domain/ports/RankingRepository.js";
import {
  UserRankingItem,
  GuideRankingItem,
  TrendingUserRankingItem,
  TrendingGuideRankingItem,
} from "@/domain/Ranking.js";
import {
  UserTrendingHistory,
  GuideBestTrending,
  TrendingAchievement,
} from "@/domain/Ranking.js";

/**
 * Composite score formulas used for ranking:
 * Guide score = likes * 10  + favorites * 7 + views * 0.1
 * User score = totalLikes * 10 + fulfilledRequests * 20 + totalViews * 0.1
 *
 * Tiebreaker: earlier account/guide creation date wins (more established)
 */
export class SqliteRankingRepository implements RankingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // User helpers
  private userScore(
    totalLikes: number,
    fulfilledRequests: number,
    totalViews: number,
  ): number {
    return totalLikes * 10 + fulfilledRequests * 20 + totalViews * 0.1;
  }

  private async getSortedUsers(): Promise<
    Array<{
      userId: string;
      username: string;
      profilePictureUrl: string | null;
      totalLikes: number;
      totalViews: number;
      fulfilledRequests: number;
      createdAt: Date;
    }>
  > {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        profile: {
          select: { profilePictureUrl: true },
        },
        archetypeInstances: {
          select: { likes: true, views: true },
        },
        guideRequestsFulfilled: {
          where: { status: "COMPLETED" },
          select: { id: true },
        },
      },
    });

    return users
      .map((user) => ({
        userId: user.id,
        username: user.name,
        profilePictureUrl: user.profile?.profilePictureUrl ?? null,
        totalLikes: user.archetypeInstances.reduce(
          (sum, instance) => sum + instance.likes,
          0,
        ),
        totalViews: user.archetypeInstances.reduce(
          (sum, instance) => sum + instance.views,
          0,
        ),
        fulfilledRequests: user.guideRequestsFulfilled.length,
        createdAt: user.createdAt,
      }))
      .sort((a, b) => {
        const scoreB = this.userScore(
          b.totalLikes,
          b.fulfilledRequests,
          b.totalViews,
        );
        const scoreA = this.userScore(
          a.totalLikes,
          a.fulfilledRequests,
          a.totalViews,
        );
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  async getUserRanking(
    page: number,
    limit: number,
  ): Promise<{ ranking: UserRankingItem[]; total: number }> {
    const skip = (page - 1) * limit;
    const sorted = await this.getSortedUsers();
    const total = sorted.length;

    const ranking = sorted.slice(skip, skip + limit).map((user, index) => ({
      userId: user.userId,
      username: user.username,
      profilePictureUrl: user.profilePictureUrl,
      totalLikes: user.totalLikes,
      totalViews: user.totalViews,
      fulfilledRequests: user.fulfilledRequests,
      rank: skip + index + 1,
    }));

    return { ranking, total };
  }

  async getUserRankById(userId: string): Promise<number> {
    const sorted = await this.getSortedUsers();
    const rank = sorted.findIndex((user) => user.userId === userId) + 1;
    return rank > 0 ? rank : 0;
  }

  // Guide helpers
  private guideScore(likes: number, favorites: number, views: number): number {
    return likes * 10 + favorites * 7 + views * 0.1;
  }

  private async getSortedGuides(): Promise<
    Array<{
      id: number;
      archetypeId: number;
      title: string;
      likes: number;
      views: number;
      favorites: number;
      guideType: string;
      createdAt: Date;
      headerCard: {
        imageUrlCropped: string | null;
        imageUrlSmall: string | null;
      } | null;
      archetype: { name: string };
      user: { name: string };
    }>
  > {
    const guides = await this.prisma.archetypeInstance.findMany({
      select: {
        id: true,
        archetypeId: true,
        title: true,
        likes: true,
        views: true,
        favorites: true,
        guideType: true,
        createdAt: true,
        headerCard: {
          select: {
            imageUrlCropped: true,
            imageUrlSmall: true,
          },
        },
        archetype: {
          select: { name: true },
        },
        user: {
          select: { name: true },
        },
      },
    });

    return guides.sort((a, b) => {
      const scoreB = this.guideScore(b.likes, b.favorites, b.views);
      const scoreA = this.guideScore(a.likes, a.favorites, a.views);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  async getGuideRanking(
    page: number,
    limit: number,
  ): Promise<{ ranking: GuideRankingItem[]; total: number }> {
    const skip = (page - 1) * limit;
    const sorted = await this.getSortedGuides();
    const total = sorted.length;

    const ranking = sorted.slice(skip, skip + limit).map((guide, index) => ({
      id: guide.id,
      archetypeId: guide.archetypeId,
      title: guide.title,
      likes: guide.likes,
      views: guide.views,
      favorites: guide.favorites,
      guideType: guide.guideType,
      headerImageUrl:
        guide.headerCard?.imageUrlCropped ??
        guide.headerCard?.imageUrlSmall ??
        null,
      authorName: guide.user.name,
      archetypeName: guide.archetype.name,
      rank: skip + index + 1,
    }));

    return { ranking, total };
  }

  // Trending guides methods
  private async getTrendingGuidesForMonth(
    month: string,
  ): Promise<
    Array<{
      id: number;
      archetypeId: number;
      title: string;
      likes: number;
      views: number;
      favorites: number;
      monthlyLikes: number;
      monthlyViews: number;
      monthlyFavorites: number;
      guideType: string;
      createdAt: Date;
      headerCard: {
        imageUrlCropped: string | null;
        imageUrlSmall: string | null;
      } | null;
      archetype: { name: string };
      user: { name: string };
    }>
  > {
    // Parse month boundaries in UTC.
    // SQLite DateTime columns are stored as ISO strings, so comparisons in raw SQL
    // should use ISO strings rather than numeric timestamps.
    const [year, monthNum] = month.split("-").map(Number);
    const startTs = Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0);
    const endTs = Date.UTC(year, monthNum, 0, 23, 59, 59, 999);
    const startIso = new Date(startTs).toISOString();
    const nextMonthStartIso = new Date(
      Date.UTC(year, monthNum, 1, 0, 0, 0, 0),
    ).toISOString();

    // Use raw SQL to get guides with activity in the target month
    // Monthly stats: only likes/favorites/views that occurred in this month
    // Total stats: accumulated over all time
    const sql = `
      SELECT 
        ai.id,
        ai.archetype_id,
        ai.title,
        ai.guide_type,
        ai.created_at,
        ai.header_card_id,
        ai.views as total_views,
        ai.likes as total_likes,
        ai.favorites as total_favorites,
        a.name as archetype_name,
        u.namedb as user_name,
        COUNT(DISTINCT il.id) as monthly_likes_count,
        COUNT(DISTINCT if.id) as monthly_favorites_count,
        COUNT(DISTINCT gvt.viewer_fingerprint) as monthly_views_count
      FROM archetype_instances ai
      JOIN archetypes a ON a.id = ai.archetype_id
      JOIN users u ON u.id = ai.user_id
      LEFT JOIN instance_likes il ON il.instance_id = ai.id 
        AND il.created_at >= ` + startTs + `
        AND il.created_at <= ` + endTs + `
      LEFT JOIN instance_favorites if ON if.instance_id = ai.id 
        AND if.created_at >= ` + startTs + `
        AND if.created_at <= ` + endTs + `
      LEFT JOIN guide_view_tracking gvt ON gvt.instance_id = ai.id
        AND gvt.last_viewed_at >= '` + startIso + `'
        AND gvt.last_viewed_at < '` + nextMonthStartIso + `'
      GROUP BY ai.id
    `;

    const guidesWithActivity = await this.prisma.$queryRawUnsafe<
      Array<{
        id: number;
        archetype_id: number;
        title: string;
        guide_type: string;
        created_at: string;
        header_card_id: number | null;
        total_views: number;
        total_likes: number;
        total_favorites: number;
        archetype_name: string;
        user_name: string;
        monthly_likes_count: number;
        monthly_favorites_count: number;
        monthly_views_count: number;
      }>
    >(sql);

    // Filter to only guides that existed during this month
    const filteredGuides = guidesWithActivity.filter(
      (g) => new Date(g.created_at).getTime() <= endTs,
    );

    // Fetch header card images for guides that have them
    const headerCards = await this.prisma.card.findMany({
      where: {
        id: {
          in: filteredGuides
            .map((g) => g.header_card_id)
            .filter((id): id is number => id !== null),
        },
      },
      select: {
        id: true,
        imageUrlCropped: true,
        imageUrlSmall: true,
      },
    });

    const headerCardMap = new Map(headerCards.map((c) => [c.id, c]));

    // Map results to expected format
    const guides = filteredGuides.map((g) => {
      const headerCard = g.header_card_id
        ? headerCardMap.get(g.header_card_id) || null
        : null;

      return {
        id: g.id,
        archetypeId: g.archetype_id,
        title: g.title,
        guideType: g.guide_type,
        createdAt: new Date(g.created_at),
        // Total accumulated stats (for display)
        likes: g.total_likes,
        favorites: g.total_favorites,
        views: g.total_views,
        // Monthly stats (for scoring and filtering)
        monthlyLikes: Number(g.monthly_likes_count),
        monthlyFavorites: Number(g.monthly_favorites_count),
        monthlyViews: Number(g.monthly_views_count),
        headerCard: headerCard
          ? {
              imageUrlCropped: headerCard.imageUrlCropped,
              imageUrlSmall: headerCard.imageUrlSmall,
            }
          : null,
        archetype: { name: g.archetype_name },
        user: { name: g.user_name },
      };
    });

    // Filter and sort using MONTHLY stats only
    // Require: (monthly likes OR monthly favorites) OR monthly views >= 50
    const guidesWithScores = guides
      .filter((guide) => guide.monthlyLikes > 0 || guide.monthlyFavorites > 0 || guide.monthlyViews >= 50)
      .sort((a, b) => {
        // Score based on MONTHLY activity only
        const scoreB = this.guideScore(b.monthlyLikes, b.monthlyFavorites, b.monthlyViews);
        const scoreA = this.guideScore(a.monthlyLikes, a.monthlyFavorites, a.monthlyViews);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    return guidesWithScores;
  }

  async getTrendingGuideRanking(
    month: string,
    page: number,
    limit: number,
  ): Promise<{ ranking: TrendingGuideRankingItem[]; total: number }> {
    const skip = (page - 1) * limit;

    // Check if we have a snapshot for this month
    const snapshot = await this.prisma.monthlyGuideRanking.findMany({
      where: { month },
      orderBy: { rank: "asc" },
      skip,
      take: limit,
    });

    // If snapshot exists and is not current month, use it
    const currentMonth = new Date()
      .toISOString()
      .slice(0, 7);
    if (snapshot.length > 0 && month !== currentMonth) {
      // Fetch full guide details for snapshot
      const guideIds = snapshot.map((s) => s.guideId);
      const guides = await this.prisma.archetypeInstance.findMany({
        where: { id: { in: guideIds } },
        select: {
          id: true,
          archetypeId: true,
          title: true,
          guideType: true,
          views: true,
          likes: true,
          favorites: true,
          headerCard: {
            select: {
              imageUrlCropped: true,
              imageUrlSmall: true,
            },
          },
          archetype: {
            select: { name: true },
          },
          user: {
            select: { name: true },
          },
        },
      });

      const guideMap = new Map(guides.map((g) => [g.id, g]));
      const ranking = snapshot
        .map((s) => {
          const guide = guideMap.get(s.guideId);
          if (!guide) return null;
          return {
            id: guide.id,
            archetypeId: guide.archetypeId,
            title: guide.title,
            // Current total stats (for display)
            likes: guide.likes,
            views: guide.views,
            favorites: guide.favorites,
            // Monthly stats from snapshot (what was earned that month)
            monthlyLikes: s.likes,
            monthlyViews: s.views,
            monthlyFavorites: s.favorites,
            guideType: guide.guideType,
            headerImageUrl:
              guide.headerCard?.imageUrlCropped ??
              guide.headerCard?.imageUrlSmall ??
              null,
            authorName: guide.user.name,
            archetypeName: guide.archetype.name,
            rank: s.rank,
            month: s.month,
          };
        })
        .filter((item): item is TrendingGuideRankingItem => item !== null);

      const total = await this.prisma.monthlyGuideRanking.count({
        where: { month },
      });

      return { ranking, total };
    }

    // Otherwise, calculate live from current data
    let sorted = await this.getTrendingGuidesForMonth(month);

    // For current month, derive monthly views from real total-view deltas so
    // every counted view can be reflected in trending (not just unique fingerprints).
    if (month === currentMonth && sorted.length > 0) {
      const guideIds = sorted.map((g) => g.id);
      const previousSnapshots = await this.prisma.monthlyGuideRanking.findMany({
        where: {
          guideId: { in: guideIds },
          month: { lt: month },
        },
        select: {
          guideId: true,
          views: true,
        },
      });

      const previousViewsByGuideId = new Map<number, number>();
      for (const snapshotRow of previousSnapshots) {
        const previous = previousViewsByGuideId.get(snapshotRow.guideId) ?? 0;
        previousViewsByGuideId.set(snapshotRow.guideId, previous + snapshotRow.views);
      }

      sorted = sorted
        .map((guide) => {
          const previousViews = previousViewsByGuideId.get(guide.id) ?? 0;
          const monthlyViews = Math.max(guide.views - previousViews, 0);
          return {
            ...guide,
            monthlyViews,
          };
        })
        .filter(
          (guide) =>
            guide.monthlyLikes > 0 ||
            guide.monthlyFavorites > 0 ||
            guide.monthlyViews >= 50,
        )
        .sort((a, b) => {
          const scoreB = this.guideScore(
            b.monthlyLikes,
            b.monthlyFavorites,
            b.monthlyViews,
          );
          const scoreA = this.guideScore(
            a.monthlyLikes,
            a.monthlyFavorites,
            a.monthlyViews,
          );
          if (scoreB !== scoreA) return scoreB - scoreA;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });
    }

    // Limit to top 15 for current month (matches snapshot behavior)
    const limitedSorted = sorted.slice(0, 15);
    const total = limitedSorted.length;

    const ranking = limitedSorted.slice(skip, skip + limit).map((guide, index) => ({
      id: guide.id,
      archetypeId: guide.archetypeId,
      title: guide.title,
      likes: guide.likes,
      views: guide.views,
      favorites: guide.favorites,
      monthlyLikes: guide.monthlyLikes,
      monthlyViews: guide.monthlyViews,
      monthlyFavorites: guide.monthlyFavorites,
      guideType: guide.guideType,
      headerImageUrl:
        guide.headerCard?.imageUrlCropped ??
        guide.headerCard?.imageUrlSmall ??
        null,
      authorName: guide.user.name,
      archetypeName: guide.archetype.name,
      rank: skip + index + 1,
      month,
    }));

    return { ranking, total };
  }

  // Trending users methods
  private async getTrendingUsersForMonth(
    month: string,
  ): Promise<
    Array<{
      userId: string;
      username: string;
      profilePictureUrl: string | null;
      totalLikes: number;
      totalViews: number;
      fulfilledRequests: number;
      monthlyLikes: number;
      monthlyViews: number;
      monthlyFulfilledRequests: number;
      createdAt: Date;
    }>
  > {
    // Parse month boundaries in UTC.
    // SQLite DateTime columns are stored as ISO strings, so comparisons in raw SQL
    // should use ISO strings rather than numeric timestamps.
    const [year, monthNum] = month.split("-").map(Number);
    const startTs = Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0);
    const endTs = Date.UTC(year, monthNum, 0, 23, 59, 59, 999);
    const startIso = new Date(startTs).toISOString();
    const nextMonthStartIso = new Date(
      Date.UTC(year, monthNum, 1, 0, 0, 0, 0),
    ).toISOString();

    // Use raw SQL to get users with activity in the target month
    // Monthly stats: only activity that occurred in this month
    // Total stats: accumulated over all time
    const sql = `
      SELECT 
        u.id as user_id,
        u.namedb as user_name,
        p.profile_picture_url,
        u.created_at as user_created_at,
        COUNT(DISTINCT il.id) as monthly_likes_count,
        COUNT(DISTINCT if.id) as monthly_favorites_count,
        COUNT(DISTINCT gr.id) as monthly_fulfilled_requests,
        COUNT(DISTINCT gvt.instance_id || '_' || gvt.viewer_fingerprint) as monthly_views_count
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN archetype_instances ai ON ai.user_id = u.id
      LEFT JOIN instance_likes il ON il.instance_id = ai.id 
        AND il.created_at >= ` + startTs + `
        AND il.created_at <= ` + endTs + `
      LEFT JOIN instance_favorites if ON if.instance_id = ai.id 
        AND if.created_at >= ` + startTs + `
        AND if.created_at <= ` + endTs + `
      LEFT JOIN guide_requests gr ON gr.fulfilled_by_id = u.id 
        AND gr.status = 'COMPLETED'
        AND gr.updated_at >= ` + startTs + `
        AND gr.updated_at <= ` + endTs + `
      LEFT JOIN guide_view_tracking gvt ON gvt.instance_id = ai.id
        AND gvt.last_viewed_at >= '` + startIso + `'
        AND gvt.last_viewed_at < '` + nextMonthStartIso + `'
      GROUP BY u.id
    `;

    const usersWithActivity = await this.prisma.$queryRawUnsafe<
      Array<{
        user_id: string;
        user_name: string;
        profile_picture_url: string | null;
        user_created_at: string;
        monthly_likes_count: number;
        monthly_favorites_count: number;
        monthly_fulfilled_requests: number;
        monthly_views_count: number;
      }>
    >(sql);

    // Filter to only users that existed during this month
    const filteredUsers = usersWithActivity.filter(
      (u) => new Date(u.user_created_at).getTime() <= endTs,
    );

    // Fetch total stats for these users (all-time accumulated)
    const userIds = filteredUsers.map((u) => u.user_id);
    const totalStatsQuery = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        archetypeInstances: {
          select: {
            likes: true,
            favorites: true,
            views: true,
          },
        },
        guideRequestsFulfilled: {
          where: { status: "COMPLETED" },
          select: { id: true },
        },
      },
    });

    const totalStatsMap = new Map(
      totalStatsQuery.map((u) => {
        const totalLikes = u.archetypeInstances.reduce(
          (sum, g) => sum + g.likes + g.favorites,
          0,
        );
        const totalViews = u.archetypeInstances.reduce(
          (sum, g) => sum + g.views,
          0,
        );
        const fulfilledRequests = u.guideRequestsFulfilled.length;
        return [u.id, { totalLikes, totalViews, fulfilledRequests }];
      }),
    );

    // Map results to expected format
    const users = filteredUsers.map((u) => {
      const totals = totalStatsMap.get(u.user_id) || {
        totalLikes: 0,
        totalViews: 0,
        fulfilledRequests: 0,
      };
      return {
        userId: u.user_id,
        username: u.user_name,
        profilePictureUrl: u.profile_picture_url,
        createdAt: new Date(u.user_created_at),
        // Total accumulated stats (for display)
        totalLikes: totals.totalLikes,
        totalViews: totals.totalViews,
        fulfilledRequests: totals.fulfilledRequests,
        // Monthly stats (for scoring and filtering)
        monthlyLikes: Number(u.monthly_likes_count) + Number(u.monthly_favorites_count),
        monthlyViews: Number(u.monthly_views_count),
        monthlyFulfilledRequests: Number(u.monthly_fulfilled_requests),
      };
    });

    // Filter and sort using MONTHLY stats only
    const usersWithScores = users
      .filter(
        (user) =>
          user.monthlyLikes > 0 ||
          user.monthlyViews >= 25 ||
          user.monthlyFulfilledRequests > 0,
      )
      .sort((a, b) => {
        // Score based on MONTHLY activity only
        const scoreB = this.userScore(
          b.monthlyLikes,
          b.monthlyFulfilledRequests,
          b.monthlyViews,
        );
        const scoreA = this.userScore(
          a.monthlyLikes,
          a.monthlyFulfilledRequests,
          a.monthlyViews,
        );
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    return usersWithScores;
  }

  async getTrendingUserRanking(
    month: string,
    page: number,
    limit: number,
  ): Promise<{ ranking: TrendingUserRankingItem[]; total: number }> {
    const skip = (page - 1) * limit;

    // Check if we have a snapshot for this month
    const snapshot = await this.prisma.monthlyUserRanking.findMany({
      where: { month },
      orderBy: { rank: "asc" },
      skip,
      take: limit,
    });

    // If snapshot exists and is not current month, use it
    const currentMonth = new Date()
      .toISOString()
      .slice(0, 7);
    if (snapshot.length > 0 && month !== currentMonth) {
      // Fetch full user details for snapshot
      const userIds = snapshot.map((s) => s.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          profile: {
            select: { profilePictureUrl: true },
          },
          archetypeInstances: {
            select: {
              views: true,
              likes: true,
              favorites: true,
            },
          },
          guideRequestsFulfilled: {
            where: { status: "COMPLETED" },
            select: { id: true },
          },
        },
      });

      const userMap = new Map(users.map((u) => {
        // Calculate current total stats
        const totalViews = u.archetypeInstances.reduce(
          (sum, guide) => sum + guide.views,
          0,
        );
        const totalLikes = u.archetypeInstances.reduce(
          (sum, guide) => sum + guide.likes + guide.favorites,
          0,
        );
        const fulfilledRequests = u.guideRequestsFulfilled.length;
        return [u.id, { ...u, totalViews, totalLikes, fulfilledRequests }];
      }));
      
      const ranking = snapshot
        .map((s) => {
          const user = userMap.get(s.userId);
          if (!user) return null;
          return {
            userId: user.id,
            username: user.name,
            profilePictureUrl: user.profile?.profilePictureUrl ?? null,
            // Current total stats (for display)
            totalLikes: user.totalLikes,
            totalViews: user.totalViews,
            fulfilledRequests: user.fulfilledRequests,
            // Monthly stats from snapshot (what was earned that month)
            monthlyLikes: s.totalLikes,
            monthlyViews: s.totalViews,
            monthlyFulfilledRequests: s.fulfilledRequests,
            rank: s.rank,
            month: s.month,
          };
        })
        .filter((item): item is TrendingUserRankingItem => item !== null);

      const total = await this.prisma.monthlyUserRanking.count({
        where: { month },
      });

      return { ranking, total };
    }

    // Otherwise, calculate live from current data
    let sorted = await this.getTrendingUsersForMonth(month);

    // For current month, derive monthly views from real total-view deltas so
    // every counted view can be reflected in trending users as well.
    if (month === currentMonth && sorted.length > 0) {
      const userIds = sorted.map((u) => u.userId);
      const previousSnapshots = await this.prisma.monthlyUserRanking.findMany({
        where: {
          userId: { in: userIds },
          month: { lt: month },
        },
        select: {
          userId: true,
          totalViews: true,
        },
      });

      const previousViewsByUserId = new Map<string, number>();
      for (const snapshotRow of previousSnapshots) {
        const previous = previousViewsByUserId.get(snapshotRow.userId) ?? 0;
        previousViewsByUserId.set(snapshotRow.userId, previous + snapshotRow.totalViews);
      }

      sorted = sorted
        .map((user) => {
          const previousViews = previousViewsByUserId.get(user.userId) ?? 0;
          const monthlyViews = Math.max(user.totalViews - previousViews, 0);
          return {
            ...user,
            monthlyViews,
          };
        })
        .filter(
          (user) =>
            user.monthlyLikes > 0 ||
            user.monthlyViews >= 25 ||
            user.monthlyFulfilledRequests > 0,
        )
        .sort((a, b) => {
          const scoreB = this.userScore(
            b.monthlyLikes,
            b.monthlyFulfilledRequests,
            b.monthlyViews,
          );
          const scoreA = this.userScore(
            a.monthlyLikes,
            a.monthlyFulfilledRequests,
            a.monthlyViews,
          );
          if (scoreB !== scoreA) return scoreB - scoreA;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });
    }

    // Limit to top 10 for current month (matches snapshot behavior)
    const limitedSorted = sorted.slice(0, 10);
    const total = limitedSorted.length;

    const ranking = limitedSorted.slice(skip, skip + limit).map((user, index) => ({
      userId: user.userId,
      username: user.username,
      profilePictureUrl: user.profilePictureUrl,
      totalLikes: user.totalLikes,
      totalViews: user.totalViews,
      fulfilledRequests: user.fulfilledRequests,
      monthlyLikes: user.monthlyLikes,
      monthlyViews: user.monthlyViews,
      monthlyFulfilledRequests: user.monthlyFulfilledRequests,
      rank: skip + index + 1,
      month,
    }));

    return { ranking, total };
  }

  // Snapshot save method
  async saveTrendingSnapshot(month: string): Promise<void> {
    console.log(`[RankingRepository] Saving trending snapshot for ${month}...`);

    // Calculate trending rankings for the month
    let trendingGuides = await this.getTrendingGuidesForMonth(month);
    let trendingUsers = await this.getTrendingUsersForMonth(month);

    // Normalize monthly views as real monthly deltas from total view counters.
    // This keeps end-of-month snapshots aligned with live trending behavior.
    if (trendingGuides.length > 0) {
      const guideIds = trendingGuides.map((g) => g.id);
      const previousGuideSnapshots = await this.prisma.monthlyGuideRanking.findMany({
        where: {
          guideId: { in: guideIds },
          month: { lt: month },
        },
        select: {
          guideId: true,
          views: true,
        },
      });

      const previousViewsByGuideId = new Map<number, number>();
      for (const snapshotRow of previousGuideSnapshots) {
        const previous = previousViewsByGuideId.get(snapshotRow.guideId) ?? 0;
        previousViewsByGuideId.set(snapshotRow.guideId, previous + snapshotRow.views);
      }

      trendingGuides = trendingGuides
        .map((guide) => {
          const previousViews = previousViewsByGuideId.get(guide.id) ?? 0;
          const monthlyViews = Math.max(guide.views - previousViews, 0);
          return {
            ...guide,
            monthlyViews,
          };
        })
        .filter(
          (guide) =>
            guide.monthlyLikes > 0 ||
            guide.monthlyFavorites > 0 ||
            guide.monthlyViews >= 50,
        )
        .sort((a, b) => {
          const scoreB = this.guideScore(
            b.monthlyLikes,
            b.monthlyFavorites,
            b.monthlyViews,
          );
          const scoreA = this.guideScore(
            a.monthlyLikes,
            a.monthlyFavorites,
            a.monthlyViews,
          );
          if (scoreB !== scoreA) return scoreB - scoreA;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });
    }

    if (trendingUsers.length > 0) {
      const userIds = trendingUsers.map((u) => u.userId);
      const previousUserSnapshots = await this.prisma.monthlyUserRanking.findMany({
        where: {
          userId: { in: userIds },
          month: { lt: month },
        },
        select: {
          userId: true,
          totalViews: true,
        },
      });

      const previousViewsByUserId = new Map<string, number>();
      for (const snapshotRow of previousUserSnapshots) {
        const previous = previousViewsByUserId.get(snapshotRow.userId) ?? 0;
        previousViewsByUserId.set(snapshotRow.userId, previous + snapshotRow.totalViews);
      }

      trendingUsers = trendingUsers
        .map((user) => {
          const previousViews = previousViewsByUserId.get(user.userId) ?? 0;
          const monthlyViews = Math.max(user.totalViews - previousViews, 0);
          return {
            ...user,
            monthlyViews,
          };
        })
        .filter(
          (user) =>
            user.monthlyLikes > 0 ||
            user.monthlyViews >= 25 ||
            user.monthlyFulfilledRequests > 0,
        )
        .sort((a, b) => {
          const scoreB = this.userScore(
            b.monthlyLikes,
            b.monthlyFulfilledRequests,
            b.monthlyViews,
          );
          const scoreA = this.userScore(
            a.monthlyLikes,
            a.monthlyFulfilledRequests,
            a.monthlyViews,
          );
          if (scoreB !== scoreA) return scoreB - scoreA;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });
    }

    // Save top 15 guides
    const guideSnapshots = trendingGuides.slice(0, 15).map((guide, index) => ({
      guideId: guide.id,
      month,
      rank: index + 1,
      score: this.guideScore(
        guide.monthlyLikes,
        guide.monthlyFavorites,
        guide.monthlyViews,
      ),
      likes: guide.monthlyLikes,
      views: guide.monthlyViews,
      favorites: guide.monthlyFavorites,
    }));

    // Save top 10 users
    const userSnapshots = trendingUsers.slice(0, 10).map((user, index) => ({
      userId: user.userId,
      month,
      rank: index + 1,
      score: this.userScore(
        user.monthlyLikes,
        user.monthlyFulfilledRequests,
        user.monthlyViews,
      ),
      totalLikes: user.monthlyLikes,
      totalViews: user.monthlyViews,
      fulfilledRequests: user.monthlyFulfilledRequests,
    }));

    // Delete existing snapshots for this month (if any)
    await this.prisma.$transaction([
      this.prisma.monthlyGuideRanking.deleteMany({ where: { month } }),
      this.prisma.monthlyUserRanking.deleteMany({ where: { month } }),
    ]);

    // Insert new snapshots
    if (guideSnapshots.length > 0) {
      await this.prisma.monthlyGuideRanking.createMany({
        data: guideSnapshots,
      });
    }

    if (userSnapshots.length > 0) {
      await this.prisma.monthlyUserRanking.createMany({
        data: userSnapshots,
      });
    }

    console.log(
      `[RankingRepository] Snapshot saved: ${guideSnapshots.length} guides, ${userSnapshots.length} users`,
    );
  }

  async getUserTrendingHistory(userId: string): Promise<UserTrendingHistory[]> {
    const history = await this.prisma.monthlyUserRanking.findMany({
      where: { userId },
      orderBy: { month: "desc" },
      select: {
        month: true,
        rank: true,
        score: true,
        totalLikes: true,
        fulfilledRequests: true,
        totalViews: true,
      },
    });

    return history.map((h) => ({
      month: h.month,
      rank: h.rank,
      score: h.score,
      totalLikes: h.totalLikes,
      fulfilledRequests: h.fulfilledRequests,
      totalViews: h.totalViews,
    }));
  }

  async getGuideBestTrending(
    guideId: number,
  ): Promise<GuideBestTrending | null> {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get all snapshot rankings for this guide
    const snapshots = await this.prisma.monthlyGuideRanking.findMany({
      where: { guideId },
      orderBy: { rank: "asc" },
      select: {
        month: true,
        rank: true,
        score: true,
        likes: true,
        favorites: true,
        views: true,
      },
    });

    // Check if current month has snapshot
    const hasCurrentMonthSnapshot = snapshots.some(s => s.month === currentMonth);

    // If no snapshot for current month, calculate live ranking
    let currentMonthRanking: GuideBestTrending | null = null;
    if (!hasCurrentMonthSnapshot) {
      const currentMonthGuides = await this.getTrendingGuidesForMonth(currentMonth);
      const guideIndex = currentMonthGuides.findIndex(g => g.id === guideId);

      // Only include if guide is in top 15
      if (guideIndex !== -1 && guideIndex < 15) {
        const guide = currentMonthGuides[guideIndex];
        currentMonthRanking = {
          month: currentMonth,
          rank: guideIndex + 1,
          score: this.guideScore(
            guide.monthlyLikes,
            guide.monthlyFavorites,
            guide.monthlyViews,
          ),
          likes: guide.monthlyLikes,
          favorites: guide.monthlyFavorites,
          views: guide.monthlyViews,
        };
      }
    }

    // Combine snapshots and current month ranking (if exists)
    const allRankings = currentMonthRanking 
      ? [currentMonthRanking, ...snapshots]
      : snapshots;

    // Return best ranking (lowest rank number)
    if (allRankings.length === 0) {
      return null;
    }

    return allRankings.reduce((best, current) => 
      current.rank < best.rank ? current : best
    );
  }

  async getUserTrendingAchievements(userId: string): Promise<TrendingAchievement[]> {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Only include closed months (snapshots with month < currentMonth).
    // The current month is shown live in RankingPopup/RankingModal, not here.
    const userHistory = await this.prisma.monthlyUserRanking.findMany({
      where: { userId, month: { lt: currentMonth } },
      orderBy: { month: "desc" },
      select: {
        month: true,
        rank: true,
        score: true,
        totalLikes: true,
        fulfilledRequests: true,
        totalViews: true,
      },
    });

    // Get all guides by this user
    const guides = await this.prisma.archetypeInstance.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        archetype: {
          select: {
            name: true,
          },
        },
        headerCard: {
          select: {
            imageUrlCropped: true,
          },
        },
      },
    });

    const achievements: TrendingAchievement[] = [];

    // Add user achievements from closed-month snapshots
    for (const history of userHistory) {
      achievements.push({
        type: "user",
        month: history.month,
        rank: history.rank,
        score: history.score,
        totalLikes: history.totalLikes,
        fulfilledRequests: history.fulfilledRequests,
        totalViews: history.totalViews,
      });
    }

    // Get guide rankings for each guide (closed months only)
    for (const guide of guides) {
      const rankings = await this.prisma.monthlyGuideRanking.findMany({
        where: { guideId: guide.id, month: { lt: currentMonth } },
        orderBy: { month: "desc" },
        select: {
          month: true,
          rank: true,
          score: true,
          likes: true,
          favorites: true,
          views: true,
        },
      });

      for (const ranking of rankings) {
        achievements.push({
          type: "guide",
          guideId: guide.id,
          guideTitle: guide.title,
          archetypeName: guide.archetype.name,
          headerImageUrl: guide.headerCard?.imageUrlCropped || null,
          month: ranking.month,
          rank: ranking.rank,
          score: ranking.score,
          likes: ranking.likes,
          favorites: ranking.favorites,
          views: ranking.views,
        });
      }
    }

    // Sort all achievements by month desc, then by rank asc
    achievements.sort((a, b) => {
      if (a.month !== b.month) {
        return b.month.localeCompare(a.month);
      }
      return a.rank - b.rank;
    });

    return achievements;
  }
}
