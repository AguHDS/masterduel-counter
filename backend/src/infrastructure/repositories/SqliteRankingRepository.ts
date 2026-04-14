import { PrismaClient } from "@prisma/client";
import { RankingRepository } from "@/domain/ports/RankingRepository.js";
import { UserRankingItem, GuideRankingItem } from "@/domain/Ranking.js";

export class SqliteRankingRepository implements RankingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getUserRanking(
    page: number,
    limit: number,
  ): Promise<{ ranking: UserRankingItem[]; total: number }> {
    const skip = (page - 1) * limit;

    const usersWithLikes = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        profile: {
          select: { profilePictureUrl: true },
        },
        archetypeInstances: {
          select: { likes: true },
        },
      },
    });

    const sorted = usersWithLikes
      .map((user) => ({
        userId: user.id,
        username: user.name,
        profilePictureUrl: user.profile?.profilePictureUrl ?? null,
        totalLikes: user.archetypeInstances.reduce(
          (sum, instance) => sum + instance.likes,
          0,
        ),
        createdAt: user.createdAt,
      }))
      .sort((a, b) => {
        if (b.totalLikes !== a.totalLikes) return b.totalLikes - a.totalLikes;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    const total = sorted.length;

    const ranking = sorted.slice(skip, skip + limit).map((user, index) => ({
      userId: user.userId,
      username: user.username,
      profilePictureUrl: user.profilePictureUrl,
      totalLikes: user.totalLikes,
      rank: skip + index + 1,
    }));

    return { ranking, total };
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
