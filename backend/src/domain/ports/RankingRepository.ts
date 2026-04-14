import { UserRankingItem, GuideRankingItem } from "@/domain/Ranking.js";

export interface RankingRepository {
  /** Get paginated user ranking sorted by total likes */
  getUserRanking(
    page: number,
    limit: number,
  ): Promise<{ ranking: UserRankingItem[]; total: number }>;

  /** Get paginated guide ranking sorted by likes */
  getGuideRanking(
    page: number,
    limit: number,
  ): Promise<{ ranking: GuideRankingItem[]; total: number }>;
}
