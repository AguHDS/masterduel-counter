import { useQuery } from "@tanstack/react-query";
import { instanceApi } from "@/lib/http/instanceApi";

export const useLatestCreatedGuides = (limit: number = 5) => {
  return useQuery({
    queryKey: ["latestCreatedGuides", limit],
    queryFn: () => instanceApi.getLatestCreatedGuides(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
