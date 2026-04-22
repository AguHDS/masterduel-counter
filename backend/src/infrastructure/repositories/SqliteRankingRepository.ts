import { PrismaClient } from "@prisma/client";
import { RankingRepository } from "@/domain/ports/RankingRepository.js";
import { UserRankingItem, GuideRankingItem } from "@/domain/Ranking.js";

export class SqliteRankingRepository implements RankingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private async getSortedUsersByLikes(): Promise<
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
    const usersWithLikes = await this.prisma.user.findMany({
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

    return usersWithLikes
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
        if (b.totalLikes !== a.totalLikes) return b.totalLikes - a.totalLikes;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  async getUserRanking(
    page: number,
    limit: number,
  ): Promise<{ ranking: UserRankingItem[]; total: number }> {
    const skip = (page - 1) * limit;
    const sorted = await this.getSortedUsersByLikes();
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
    const sorted = await this.getSortedUsersByLikes();
    const rank = sorted.findIndex((user) => user.userId === userId) + 1;
    return rank > 0 ? rank : 0;
  }

  async getGuideRanking(
    page: number,
    limit: number,
  ): Promise<{ ranking: GuideRankingItem[]; total: number }> {
    const skip = (page - 1) * limit;

    const [total, guides] = await Promise.all([
      this.prisma.archetypeInstance.count(),
      this.prisma.archetypeInstance.findMany({
        orderBy: [{ likes: "desc" }, { createdAt: "asc" }],
        skip,
        take: limit,
        select: {
          id: true,
          archetypeId: true,
          title: true,
          likes: true,
          views: true,
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
      }),
    ]);

    const ranking = guides.map((guide, index) => ({
      id: guide.id,
      archetypeId: guide.archetypeId,
      title: guide.title,
      likes: guide.likes,
      views: guide.views,
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
