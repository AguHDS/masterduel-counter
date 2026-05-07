import { axiosClient } from "@/lib/http/axiosClient";
import type {
  RankingUser,
  RankingGuide,
  TrendingRankingUser,
  TrendingRankingGuide,
} from "../types/ranking.types";

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

interface TrendingUserRankingResponse {
  success: boolean;
  ranking: TrendingRankingUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TrendingGuideRankingResponse {
  success: boolean;
  ranking: TrendingRankingGuide[];
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
    limit: number = 100,
  ): Promise<RankingResponse> => {
    const response = await axiosClient.get<RankingResponse>(`/api/ranking`, {
      params: { page, limit },
    });
    return response.data;
  },

  getGuideRanking: async (
    page: number = 1,
    limit: number = 100,
  ): Promise<GuideRankingResponse> => {
    const response = await axiosClient.get<GuideRankingResponse>(
      `/api/ranking/guides`,
      { params: { page, limit } },
    );
    return response.data;
  },

  getTrendingGuideRanking: async (
    month: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<TrendingGuideRankingResponse> => {
    const response = await axiosClient.get<TrendingGuideRankingResponse>(
      `/api/ranking/trending/guides`,
      { params: { month, page, limit } },
    );
    return response.data;
  },

  getTrendingUserRanking: async (
    month: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<TrendingUserRankingResponse> => {
    const response = await axiosClient.get<TrendingUserRankingResponse>(
      `/api/ranking/trending/users`,
      { params: { month, page, limit } },
    );
    return response.data;
  },
};
