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
 * Get user instance guide for an archetype
 * Can fetch by instanceId (when editing existing) or return undefined (when creating new)
 */
export const useGetGuideInstance = (
  archetypeId: number | undefined,
  instanceId: number | undefined,
) => {
  return useQuery<UserInstanceWithCardPairs>({
    queryKey: ["userInstance", archetypeId, instanceId],
    queryFn: () => instanceApi.getInstanceGuideById(instanceId!),
    staleTime: 0,
    enabled: !!archetypeId && !!instanceId,
  });
};

/**
 * Save a guide for an archetype
 */
export const useSaveGuide = () => {
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
