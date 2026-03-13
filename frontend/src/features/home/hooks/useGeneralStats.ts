import { useQuery } from "@tanstack/react-query";
import { archetypeApi } from "@/lib/http/archetypeApi";

export interface GeneralStatsData {
  totalArchetypes: number;
  totalGuides: number;
  topArchetypes: Array<{
    id: number;
    name: string;
    guideCount: number;
  }>;
}

export const useGeneralStats = (limit: number = 15) => {
  return useQuery({
    queryKey: ["generalStats", limit],
    queryFn: async (): Promise<GeneralStatsData> => {
      const data = await archetypeApi.getGeneralStats(limit);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};