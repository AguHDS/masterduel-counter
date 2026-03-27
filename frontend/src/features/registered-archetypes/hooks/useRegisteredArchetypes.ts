import { useQuery } from "@tanstack/react-query";
import { queryKeys, QUERY_STALE_TIME } from "@/lib/query";
import {
  getRegisteredArchetypes,
  type RegisteredArchetypesResponse,
} from "@/features/registered-archetypes/api/archetypesListApi";
import type { GuideType } from "@/features/archetypes/types";

/**
 * Hook to get all registered archetypes
 * Optionally filtered by guide type
 * Uses DEFAULT stale time (5 minutes)
 */
export const useRegisteredArchetypes = (
  sortBy: "recent" | "instances" = "recent",
  guideType?: GuideType
) => {
  return useQuery<RegisteredArchetypesResponse>({
    queryKey: [...queryKeys.archetypes.registered(), sortBy, guideType],
    queryFn: () => getRegisteredArchetypes(sortBy, guideType),
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });
};