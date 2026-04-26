import { PrismaClient } from "@prisma/client";
import { RankingRepository } from "@/domain/ports/RankingRepository.js";
import { UserRankingItem, GuideRankingItem } from "@/domain/Ranking.js";

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
}
