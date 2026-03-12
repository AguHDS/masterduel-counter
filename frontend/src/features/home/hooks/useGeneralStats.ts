import { useQuery } from "@tanstack/react-query";

interface GeneralStatsData {
  totalArchetypes: number;
  totalGuides: number;
  topArchetypes: Array<{
    id: number;
    name: string;
    guideCount: number;
  }>;
}

const mockGeneralStats: GeneralStatsData = {
  totalArchetypes: 127,
  totalGuides: 342,
  topArchetypes: [
    { id: 1, name: "Labrynth", guideCount: 45 },
    { id: 2, name: "Kashtira", guideCount: 38 },
    { id: 3, name: "Snake-Eye", guideCount: 35 },
    { id: 4, name: "Branded Despia", guideCount: 32 },
    { id: 5, name: "Rescue-Ace", guideCount: 29 },
    { id: 6, name: "Purrely", guideCount: 27 },
    { id: 7, name: "Tearlaments", guideCount: 25 },
    { id: 8, name: "Runick", guideCount: 23 },
    { id: 9, name: "Mathmech", guideCount: 21 },
    { id: 10, name: "Spright", guideCount: 19 },
    { id: 11, name: "Swordsoul", guideCount: 18 },
    { id: 12, name: "Eldlich", guideCount: 16 },
    { id: 13, name: "Live Twin", guideCount: 15 },
    { id: 14, name: "Tri-Brigade", guideCount: 14 },
    { id: 15, name: "Branded Bystial", guideCount: 13 },
  ],
};

export const useGeneralStats = (limit: number = 15) => {
  return useQuery({
    queryKey: ["generalStats", limit],
    queryFn: async (): Promise<GeneralStatsData> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        ...mockGeneralStats,
        topArchetypes: mockGeneralStats.topArchetypes.slice(0, limit),
      };
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
