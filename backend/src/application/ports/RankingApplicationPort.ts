import { UserRankingItem, GuideRankingItem, RankingResult } from "@/domain/Ranking.js";

export interface RankingApplicationPort {
  /** Get paginated user ranking sorted by total likes */
  getUserRanking(
    page: number,
    limit: number,
  ): Promise<RankingResult<UserRankingItem>>;

  /** Get paginated guide ranking sorted by likes */
  getGuideRanking(
    page: number,
    limit: number,
  ): Promise<RankingResult<GuideRankingItem>>;
}
