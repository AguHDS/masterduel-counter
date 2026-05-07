import { PrismaClient } from "@prisma/client";
import { RankingRepository } from "@/domain/ports/RankingRepository.js";
import {
  UserRankingItem,
  GuideRankingItem,
  TrendingUserRankingItem,
  TrendingGuideRankingItem,
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
    // Parse month to get start and end dates as UTC timestamps (milliseconds)
    const [year, monthNum] = month.split("-").map(Number);
    const startTs = Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0);
    const endTs = Date.UTC(year, monthNum, 0, 23, 59, 59, 999);

    // Use raw SQL to get guides with activity in the target month
    // NOTE: We don't filter by ai.created_at in SQL because Prisma has issues
    // with WHERE comparisons on DateTime fields with SQLite. We filter in JS instead.
    const sql = `
      SELECT 
        ai.id,
        ai.archetype_id,
        ai.title,
        ai.guide_type,
        ai.created_at,
        ai.header_card_id,
        a.name as archetype_name,
        u.namedb as user_name,
        COUNT(DISTINCT il.id) as likes_count,
        COUNT(DISTINCT if.id) as favorites_count
      FROM archetype_instances ai
      JOIN archetypes a ON a.id = ai.archetype_id
      JOIN users u ON u.id = ai.user_id
      LEFT JOIN instance_likes il ON il.instance_id = ai.id 
        AND il.created_at >= ` + startTs + ` 
        AND il.created_at <= ` + endTs + `
      LEFT JOIN instance_favorites if ON if.instance_id = ai.id 
        AND if.created_at >= ` + startTs + ` 
        AND if.created_at <= ` + endTs + `
      GROUP BY ai.id
    `;

    const guidesWithActivity = await this.prisma.$queryRawUnsafe<
      Array<{
        id: number;
        archetype_id: number;
        title: string;
        guide_type: string;
        created_at: number;
        header_card_id: number | null;
        archetype_name: string;
        user_name: string;
        likes_count: number;
        favorites_count: number;
      }>
    >(sql);

    // Filter to only guides that existed during this month
    const filteredGuides = guidesWithActivity.filter(
      (g) => g.created_at <= endTs,
    );

    // Get view counts for the month
    const viewSql = `
      SELECT instance_id, COUNT(DISTINCT viewer_fingerprint) as view_count
      FROM guide_view_tracking
      WHERE last_viewed_at >= ` + startTs + ` AND last_viewed_at <= ` + endTs + `
      GROUP BY instance_id
    `;

    const viewCounts = await this.prisma.$queryRawUnsafe<
      Array<{ instance_id: number; view_count: number }>
    >(viewSql);

    const viewCountMap = new Map(
      viewCounts.map((vc) => [vc.instance_id, vc.view_count]),
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
        likes: Number(g.likes_count),
        favorites: Number(g.favorites_count),
        views: viewCountMap.get(g.id) ?? 0,
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

    // Filter and sort
    const guidesWithScores = guides
      .filter((guide) => guide.likes > 0 || guide.favorites > 0 || guide.views > 0)
      .sort((a, b) => {
        const scoreB = this.guideScore(b.likes, b.favorites, b.views);
        const scoreA = this.guideScore(a.likes, a.favorites, a.views);
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
            likes: s.likes,
            views: s.views,
            favorites: s.favorites,
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
    const sorted = await this.getTrendingGuidesForMonth(month);
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
      createdAt: Date;
    }>
  > {
    // Parse month to get start and end dates as UTC timestamps (milliseconds)
    const [year, monthNum] = month.split("-").map(Number);
    const startTs = Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0);
    const endTs = Date.UTC(year, monthNum, 0, 23, 59, 59, 999);

    // Use raw SQL to get users with activity in the target month
    // NOTE: We don't filter by u.created_at in SQL because Prisma has issues
    // with WHERE comparisons on DateTime fields with SQLite. We filter in JS instead.
    const sql = `
      SELECT 
        u.id as user_id,
        u.namedb as user_name,
        p.profile_picture_url,
        u.created_at as user_created_at,
        COUNT(DISTINCT il.id) as likes_count,
        COUNT(DISTINCT if.id) as favorites_count,
        COUNT(DISTINCT gr.id) as fulfilled_requests
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
      GROUP BY u.id
    `;

    const usersWithActivity = await this.prisma.$queryRawUnsafe<
      Array<{
        user_id: string;
        user_name: string;
        profile_picture_url: string | null;
        user_created_at: number;
        likes_count: number;
        favorites_count: number;
        fulfilled_requests: number;
      }>
    >(sql);

    // Filter to only users that existed during this month
    const filteredUsers = usersWithActivity.filter(
      (u) => u.user_created_at <= endTs,
    );

    // Get view counts for user's guides in the month
    const viewSql = `
      SELECT ai.user_id, COUNT(DISTINCT gvt.viewer_fingerprint) as view_count
      FROM archetype_instances ai
      JOIN guide_view_tracking gvt ON gvt.instance_id = ai.id
      WHERE gvt.last_viewed_at >= ` + startTs + ` AND gvt.last_viewed_at <= ` + endTs + `
      GROUP BY ai.user_id
    `;

    const viewCounts = await this.prisma.$queryRawUnsafe<
      Array<{ user_id: string; view_count: number }>
    >(viewSql);

    const viewCountMap = new Map(
      viewCounts.map((vc) => [vc.user_id, Number(vc.view_count)]),
    );

    // Map results to expected format
    const users = filteredUsers.map((u) => ({
      userId: u.user_id,
      username: u.user_name,
      profilePictureUrl: u.profile_picture_url,
      createdAt: new Date(u.user_created_at),
      totalLikes: Number(u.likes_count) + Number(u.favorites_count),
      totalViews: viewCountMap.get(u.user_id) ?? 0,
      fulfilledRequests: Number(u.fulfilled_requests),
    }));

    // Filter and sort
    const usersWithScores = users
      .filter(
        (user) =>
          user.totalLikes > 0 ||
          user.totalViews > 0 ||
          user.fulfilledRequests > 0,
      )
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
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));
      const ranking = snapshot
        .map((s) => {
          const user = userMap.get(s.userId);
          if (!user) return null;
          return {
            userId: user.id,
            username: user.name,
            profilePictureUrl: user.profile?.profilePictureUrl ?? null,
            totalLikes: s.totalLikes,
            totalViews: s.totalViews,
            fulfilledRequests: s.fulfilledRequests,
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
    const sorted = await this.getTrendingUsersForMonth(month);
    const total = sorted.length;

    const ranking = sorted.slice(skip, skip + limit).map((user, index) => ({
      userId: user.userId,
      username: user.username,
      profilePictureUrl: user.profilePictureUrl,
      totalLikes: user.totalLikes,
      totalViews: user.totalViews,
      fulfilledRequests: user.fulfilledRequests,
      rank: skip + index + 1,
      month,
    }));

    return { ranking, total };
  }

  // Snapshot save method
  async saveTrendingSnapshot(month: string): Promise<void> {
    console.log(`[RankingRepository] Saving trending snapshot for ${month}...`);

    // Calculate trending rankings for the month
    const trendingGuides = await this.getTrendingGuidesForMonth(month);
    const trendingUsers = await this.getTrendingUsersForMonth(month);

    // Save top 50 guides
    const guideSnapshots = trendingGuides.slice(0, 50).map((guide, index) => ({
      guideId: guide.id,
      month,
      rank: index + 1,
      score: this.guideScore(guide.likes, guide.favorites, guide.views),
      likes: guide.likes,
      views: guide.views,
      favorites: guide.favorites,
    }));

    // Save top 50 users
    const userSnapshots = trendingUsers.slice(0, 50).map((user, index) => ({
      userId: user.userId,
      month,
      rank: index + 1,
      score: this.userScore(
        user.totalLikes,
        user.fulfilledRequests,
        user.totalViews,
      ),
      totalLikes: user.totalLikes,
      totalViews: user.totalViews,
      fulfilledRequests: user.fulfilledRequests,
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
}
