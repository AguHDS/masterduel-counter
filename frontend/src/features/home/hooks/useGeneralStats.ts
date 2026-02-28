import { useQuery } from "@tanstack/react-query";
import { archetypeApi } from "@/lib/http/archetypeApi";

export const useGeneralStats = (limit: number = 15) => {
  return useQuery({
    queryKey: ["generalStats", limit],
    queryFn: () => archetypeApi.getGeneralStats(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
