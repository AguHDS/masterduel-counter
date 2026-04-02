import { useQuery } from "@tanstack/react-query";
import { guideInstancesApi } from "@/lib/http/guideInstancesApi";
import type { GuideType } from "@/features/archetypes/types";

export const useLatestCreatedGuides = (limit: number = 5, guideType?: GuideType) => {
  return useQuery({
    queryKey: ["latestCreatedGuides", limit, guideType],
    queryFn: () => guideInstancesApi.getLatestCreatedGuides(limit, guideType),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
