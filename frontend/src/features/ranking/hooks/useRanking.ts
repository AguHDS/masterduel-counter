import { useQuery } from "@tanstack/react-query";
import { rankingApi } from "../api/rankingApi";

export const useRanking = (page: number = 1, limit: number = 100) => {
  return useQuery({
    queryKey: ["user-ranking", page, limit],
    queryFn: () => rankingApi.getUserRanking(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGuideRanking = (page: number = 1, limit: number = 100) => {
  return useQuery({
    queryKey: ["ranking-guides", page, limit],
    queryFn: () => rankingApi.getGuideRanking(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrendingGuideRanking = (
  month: string,
  page: number = 1,
  limit: number = 100,
) => {
  return useQuery({
    queryKey: ["trending-guides", month, page, limit],
    queryFn: () => rankingApi.getTrendingGuideRanking(month, page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrendingUserRanking = (
  month: string,
  page: number = 1,
  limit: number = 100,
) => {
  return useQuery({
    queryKey: ["trending-users", month, page, limit],
    queryFn: () => rankingApi.getTrendingUserRanking(month, page, limit),
    staleTime: 5 * 60 * 1000,
  });
};
