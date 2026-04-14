import { useQuery } from "@tanstack/react-query";
import { rankingApi } from "../api/rankingApi";

export const useRanking = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ["user-ranking", page, limit],
    queryFn: () => rankingApi.getUserRanking(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGuideRanking = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ["ranking-guides", page, limit],
    queryFn: () => rankingApi.getGuideRanking(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};
