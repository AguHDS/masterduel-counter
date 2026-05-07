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
}

export interface TrendingUserRankingItem extends UserRankingItem {
  month: string; // Format: YYYY-MM
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
