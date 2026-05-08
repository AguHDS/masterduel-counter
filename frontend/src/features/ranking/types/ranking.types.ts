export interface RankingUser {
  userId: string;
  username: string;
  profilePictureUrl: string;
  totalLikes: number;
  totalViews: number;
  fulfilledRequests: number;
  rank: number;
}

export interface RankingGuide {
  id: number;
  archetypeId: number;
  title: string;
  likes: number;
  views: number;
  favorites: number;
  guideType: string;
  headerImageUrl: string | null;
  authorName: string;
  archetypeName: string;
  rank: number;
}

export interface TrendingRankingUser extends RankingUser {
  month: string; // Format: YYYY-MM
  monthlyLikes?: number;
  monthlyViews?: number;
  monthlyFulfilledRequests?: number;
}

export interface TrendingRankingGuide extends RankingGuide {
  month: string; // Format: YYYY-MM
  monthlyLikes?: number;
  monthlyViews?: number;
  monthlyFavorites?: number;
}

export interface RankingResponse {
  ranking: RankingUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GuideRankingResponse {
  ranking: RankingGuide[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TrendingUserRankingResponse {
  ranking: TrendingRankingUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TrendingGuideRankingResponse {
  ranking: TrendingRankingGuide[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserTrendingHistory {
  month: string; // Format: "YYYY-MM"
  rank: number;
  score: number;
  totalLikes: number;
  fulfilledRequests: number;
  totalViews: number;
}

export interface GuideBestTrending {
  month: string; // Format: "YYYY-MM"
  rank: number;
  score: number;
  likes: number;
  favorites: number;
  views: number;
}

export interface GuideTrendingAchievement {
  type: "guide";
  guideId: number;
  guideTitle: string;
  archetypeName: string;
  headerImageUrl: string | null;
  month: string;
  rank: number;
  score: number;
  likes: number;
  favorites: number;
  views: number;
}

export interface UserTrendingAchievement {
  type: "user";
  month: string;
  rank: number;
  score: number;
  totalLikes: number;
  fulfilledRequests: number;
  totalViews: number;
}

export type TrendingAchievement = GuideTrendingAchievement | UserTrendingAchievement;

export interface UserTrendingHistoryResponse {
  success: boolean;
  history: UserTrendingHistory[];
}

export interface GuideBestTrendingResponse {
  success: boolean;
  bestTrending: GuideBestTrending | null;
}

export interface UserTrendingAchievementsResponse {
  success: boolean;
  achievements: TrendingAchievement[];
}
