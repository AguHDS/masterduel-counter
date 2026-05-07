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

export const useUserTrendingHistory = (userId: string) => {
  return useQuery({
    queryKey: ["user-trending-history", userId],
    queryFn: () => rankingApi.getUserTrendingHistory(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
};

export const useGuideBestTrending = (guideId: number) => {
  return useQuery({
    queryKey: ["guide-best-trending", guideId],
    queryFn: () => rankingApi.getGuideBestTrending(guideId),
    staleTime: 5 * 60 * 1000,
    enabled: guideId > 0,
  });
};

export const useUserTrendingAchievements = (userId: string) => {
  return useQuery({
    queryKey: ["user-trending-achievements", userId],
    queryFn: () => rankingApi.getUserTrendingAchievements(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
};
