import { useQuery } from "@tanstack/react-query";
import { guideInstancesApi } from "@/lib/http/guideInstancesApi";

export const useLatestCreatedGuides = (limit: number = 5) => {
  return useQuery({
    queryKey: ["latestCreatedGuides", limit],
    queryFn: () => guideInstancesApi.getLatestCreatedGuides(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
