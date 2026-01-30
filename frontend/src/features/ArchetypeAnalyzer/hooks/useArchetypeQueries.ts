import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, QUERY_STALE_TIME } from "@/lib/query";
import {
  searchArchetypes,
  registerArchetype,
  getArchetypeWithHeaderCard,
  type SearchResponse,
  type RegisterArchetypeResponse,
  type CardPairDTO,
} from "../api/archetypeApi";
import {
  instanceApi,
  type UserInstanceWithCardPairs,
} from "@/lib/http/instanceApi";

/**
 * Hook to search archetypes
 * Uses SHORT stale time for real-time search experience
 */
export const useSearchArchetypes = (
  searchQuery: string,
  limit: number = 50,
) => {
  return useQuery<SearchResponse>({
    queryKey: queryKeys.archetypes.search(searchQuery, limit),
    queryFn: () => searchArchetypes(searchQuery, limit),
    staleTime: QUERY_STALE_TIME.SHORT,
    enabled: searchQuery.trim().length > 0,
  });
};

/**
 * Hook to get archetype with header card
 * Uses LONG stale time since header cards rarely change
 */
export const useArchetypeWithHeader = (archetypeId: number | undefined) => {
  return useQuery({
    queryKey: queryKeys.archetypes.withHeader(archetypeId!),
    queryFn: () => getArchetypeWithHeaderCard(archetypeId!),
    staleTime: QUERY_STALE_TIME.LONG,
    enabled: !!archetypeId,
  });
};

/**
 * Hook to get user instance with card pairs
 * Uses staleTime: 0 to always refetch and ensure likes are up to date
 * Can fetch by instanceId (when editing existing) or return undefined (when creating new)
 */
export const useUserInstance = (
  archetypeId: number | undefined,
  instanceId: number | undefined,
) => {
  return useQuery<UserInstanceWithCardPairs>({
    queryKey: ["userInstance", archetypeId, instanceId],
    queryFn: () => instanceApi.getInstanceById(instanceId!),
    staleTime: 0, // Always refetch to ensure likes and data are up to date
    enabled: !!archetypeId && !!instanceId,
  });
};

/**
 * Hook to register an archetype
 */
export const useRegisterArchetype = () => {
  const queryClient = useQueryClient();

  return useMutation<
    RegisterArchetypeResponse,
    Error,
    {
      archetypeId: number;
      cardPairs: CardPairDTO[];
      title: string;
      headerCardId?: number;
      generalTip?: string;
      instanceId?: number;
    }
  >({
    mutationFn: ({ archetypeId, cardPairs, title, headerCardId, generalTip, instanceId }) =>
      registerArchetype(
        archetypeId,
        cardPairs,
        title,
        headerCardId,
        generalTip,
        instanceId,
      ),
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.archetypes.withHeader(variables.archetypeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.archetypes.cardPairs(variables.archetypeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.archetypes.registered(),
      });
    },
  });
};
