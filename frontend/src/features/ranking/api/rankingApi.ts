import { axiosClient } from "@/lib/http/axiosClient";
import type {
  RankingUser,
  RankingGuide,
  TrendingRankingUser,
  TrendingRankingGuide,
  UserTrendingHistoryResponse,
  GuideBestTrendingResponse,
  UserTrendingAchievementsResponse,
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

  getUserTrendingHistory: async (
    userId: string,
  ): Promise<UserTrendingHistoryResponse> => {
    const response = await axiosClient.get<UserTrendingHistoryResponse>(
      `/api/ranking/user/${userId}/trending-history`,
    );
    return response.data;
  },

  getGuideBestTrending: async (
    guideId: number,
  ): Promise<GuideBestTrendingResponse> => {
    const response = await axiosClient.get<GuideBestTrendingResponse>(
      `/api/ranking/guide/${guideId}/best-trending`,
    );
    return response.data;
  },

  getUserTrendingAchievements: async (
    userId: string,
  ): Promise<UserTrendingAchievementsResponse> => {
    const response = await axiosClient.get<UserTrendingAchievementsResponse>(
      `/api/ranking/user/${userId}/trending-achievements`,
    );
    return response.data;
  },
};
