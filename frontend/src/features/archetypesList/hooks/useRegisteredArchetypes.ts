import { useQuery } from "@tanstack/react-query";
import { queryKeys, QUERY_STALE_TIME } from "@/lib/query";
import {
  getRegisteredArchetypes,
  type RegisteredArchetypesResponse,
} from "@/features/ArchetypeAnalyzer/api/archetypeApi";

/**
 * Hook to get all registered archetypes
 * Uses DEFAULT stale time (5 minutes)
 */
export const useRegisteredArchetypes = () => {
  return useQuery<RegisteredArchetypesResponse>({
    queryKey: queryKeys.archetypes.registered(),
    queryFn: getRegisteredArchetypes,
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });
};
