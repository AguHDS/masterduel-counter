import {
  UserRankingItem,
  GuideRankingItem,
  TrendingUserRankingItem,
  TrendingGuideRankingItem,
  RankingResult,
} from "@/domain/Ranking.js";

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

  /** Get paginated trending guide ranking for a specific month */
  getTrendingGuideRanking(
    month: string,
    page: number,
    limit: number,
  ): Promise<RankingResult<TrendingGuideRankingItem>>;

  /** Get paginated trending user ranking for a specific month */
  getTrendingUserRanking(
    month: string,
    page: number,
    limit: number,
  ): Promise<RankingResult<TrendingUserRankingItem>>;
}
