import { useQuery } from "@tanstack/react-query";
import { rankingApi } from "@/lib/http/rankingApi";

export const useRanking = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ["ranking", page, limit],
    queryFn: () => rankingApi.getRanking(page, limit),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
