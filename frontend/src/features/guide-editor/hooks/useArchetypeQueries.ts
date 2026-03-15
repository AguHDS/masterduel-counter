import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import {
  saveArchetypeGuide,
  type SaveArchetypeGuideResponse,
  type CardPairDTO,
} from "../api/guideEditorApi";
import {
  instanceApi,
  type UserInstanceWithCardPairs,
} from "@/lib/http/instanceApi";

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
 * Hook to save a guide for an archetype
 */
export const useRegisterArchetype = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SaveArchetypeGuideResponse,
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
    mutationFn: ({
      archetypeId,
      cardPairs,
      title,
      headerCardId,
      generalTip,
      instanceId,
    }) =>
      saveArchetypeGuide(
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
