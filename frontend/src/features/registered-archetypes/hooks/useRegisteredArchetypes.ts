import { useQuery } from "@tanstack/react-query";
import { queryKeys, QUERY_STALE_TIME } from "@/lib/query";
import {
  getRegisteredArchetypes,
  type RegisteredArchetypesResponse,
} from "@/features/registered-archetypes/api/archetypesListApi";

/**
 * Hook to get all registered archetypes
 * Uses DEFAULT stale time (5 minutes)
 */
export const useRegisteredArchetypes = (
  sortBy: "recent" | "instances" = "recent"
) => {
  return useQuery<RegisteredArchetypesResponse>({
    queryKey: [...queryKeys.archetypes.registered(), sortBy],
    queryFn: () => getRegisteredArchetypes(sortBy),
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });
};