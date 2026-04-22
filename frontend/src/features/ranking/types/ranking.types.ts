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
  guideType: string;
  headerImageUrl: string | null;
  authorName: string;
  archetypeName: string;
  rank: number;
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
