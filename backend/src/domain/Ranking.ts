export interface UserRankingItem {
  userId: string;
  username: string;
  profilePictureUrl: string | null;
  totalLikes: number;
  totalViews: number;
  fulfilledRequests: number;
  rank: number;
}

export interface GuideRankingItem {
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

export interface TrendingGuideRankingItem extends GuideRankingItem {
  month: string; // Format: YYYY-MM
  monthlyLikes?: number;
  monthlyViews?: number;
  monthlyFavorites?: number;
}

export interface TrendingUserRankingItem extends UserRankingItem {
  month: string; // Format: YYYY-MM
  monthlyLikes?: number;
  monthlyViews?: number;
  monthlyFulfilledRequests?: number;
}

export interface RankingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RankingResult<T> {
  ranking: T[];
  pagination: RankingPagination;
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
