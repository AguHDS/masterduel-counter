import {
  UserRankingItem,
  GuideRankingItem,
  TrendingUserRankingItem,
  TrendingGuideRankingItem,
} from "@/domain/Ranking.js";

export interface RankingRepository {
  /** Get paginated user ranking sorted by total likes */
  getUserRanking(
    page: number,
    limit: number,
  ): Promise<{ ranking: UserRankingItem[]; total: number }>;

  /** Get the rank position for a single user */
  getUserRankById(userId: string): Promise<number>;

  /** Get paginated guide ranking sorted by likes */
  getGuideRanking(
    page: number,
    limit: number,
  ): Promise<{ ranking: GuideRankingItem[]; total: number }>;

  /** Get paginated trending guide ranking for a specific month */
  getTrendingGuideRanking(
    month: string,
    page: number,
    limit: number,
  ): Promise<{ ranking: TrendingGuideRankingItem[]; total: number }>;

  /** Get paginated trending user ranking for a specific month */
  getTrendingUserRanking(
    month: string,
    page: number,
    limit: number,
  ): Promise<{ ranking: TrendingUserRankingItem[]; total: number }>;

  /** Save trending snapshot for a specific month (called by cron job) */
  saveTrendingSnapshot(month: string): Promise<void>;
}
