import {
  UserRankingItem,
  GuideRankingItem,
  TrendingUserRankingItem,
  TrendingGuideRankingItem,
  RankingResult,
} from "@/domain/Ranking.js";
import {
  UserTrendingHistory,
  GuideBestTrending,
  TrendingAchievement,
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

  /** Get trending history for a specific user (sorted by date descending) - used in user profile */
  getUserTrendingHistory(userId: string): Promise<UserTrendingHistory[]>;

  /** Get the best trending achievement for a specific guide - used in user profile */
  getGuideBestTrending(guideId: number): Promise<GuideBestTrending | null>;

  /** Get all trending achievements for a user (both user rankings and guide rankings) - used in user profile */
  getUserTrendingAchievements(userId: string): Promise<TrendingAchievement[]>;
}
