export interface RankingUser {
  userId: string;
  username: string;
  profilePictureUrl: string;
  totalLikes: number;
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
