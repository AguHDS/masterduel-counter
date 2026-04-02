import { axiosClient } from "@/lib/http/axiosClient";
import type { RankingUser } from "../types/ranking.types";

interface RankingResponse {
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
