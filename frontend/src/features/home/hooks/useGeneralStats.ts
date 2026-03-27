import { useQuery } from "@tanstack/react-query";
import { homeApi } from "../api/homeApi";

export interface GeneralStatsData {
  totalArchetypes: number;
  totalGuides: number;
  topArchetypes: Array<{
    id: number;
    name: string;
    guideCount: number;
  }>;
}

export const useGeneralStats = (limit: number = 15, guideType?: 'COUNTER' | 'DECK') => {
  return useQuery({
    queryKey: ["generalStats", limit, guideType],
    queryFn: async (): Promise<GeneralStatsData> => {
      const data = await homeApi.getGeneralStats(limit, guideType);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};