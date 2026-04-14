import { axiosClient } from "@/lib/http/axiosClient";
import type { RankingUser, RankingGuide } from "../types/ranking.types";

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

interface GuideRankingResponse {
  success: boolean;
  ranking: RankingGuide[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const rankingApi = {
  getUserRanking: async (
    page: number = 1,
    limit: number = 50,
  ): Promise<RankingResponse> => {
    const response = await axiosClient.get<RankingResponse>(`/api/ranking`, {
      params: { page, limit },
    });
    return response.data;
  },

  getGuideRanking: async (
    page: number = 1,
    limit: number = 50,
  ): Promise<GuideRankingResponse> => {
    const response = await axiosClient.get<GuideRankingResponse>(
      `/api/ranking/guides`,
      { params: { page, limit } },
    );
    return response.data;
  },
};
