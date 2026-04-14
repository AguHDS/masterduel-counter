import { RankingApplicationPort } from "@/application/ports/RankingApplicationPort.js";
import { RankingRepository } from "@/domain/ports/RankingRepository.js";
import { UserRankingItem, GuideRankingItem, RankingResult } from "@/domain/Ranking.js";

export class RankingApplicationService implements RankingApplicationPort {
  constructor(private readonly rankingRepository: RankingRepository) {}

  async getUserRanking(
    page: number,
    limit: number,
  ): Promise<RankingResult<UserRankingItem>> {
    const { ranking, total } = await this.rankingRepository.getUserRanking(
      page,
      limit,
    );
    return {
      ranking,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGuideRanking(
    page: number,
    limit: number,
  ): Promise<RankingResult<GuideRankingItem>> {
    const { ranking, total } = await this.rankingRepository.getGuideRanking(
      page,
      limit,
    );
    return {
      ranking,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
