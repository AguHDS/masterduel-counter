import { axiosClient } from "./axiosClient";

export interface RankingUser {
  userId: string;
  username: string;
  profilePictureUrl: string;
  totalLikes: number;
  rank: number;
}

export interface RankingResponse {
  success: boolean;
  ranking: RankingUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const rankingApi = {
  getRanking: async (
    page: number = 1,
    limit: number = 50,
  ): Promise<RankingResponse> => {
    const response = await axiosClient.get<RankingResponse>(`/api/ranking`, {
      params: { page, limit },
    });
    return response.data;
  },
};
