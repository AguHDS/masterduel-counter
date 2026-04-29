import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import {
  saveArchetypeGuide,
  getInstanceGuideById,
  type SaveArchetypeGuideResponse,
  type CardPairDTO,
  type FinalBoardDTO,
} from "../api/guideEditorApi";
import type { GuideInstanceWithFullDetails } from "@/lib/http/guideInstancesApi";
import type { GuideType } from "@/features/archetypes/types";

/**
 * Fetches a guide instance by ID for editing or viewing
 * Returns undefined when creating new guides (no instanceId provided)
 */
export const useGetGuideInstance = (
  _archetypeId: number | undefined,
  instanceId: number | undefined,
) => {
  return useQuery<GuideInstanceWithFullDetails>({
    queryKey: ["userInstance", instanceId],
    queryFn: () => getInstanceGuideById(instanceId!),
    staleTime: 0,
    enabled: !!instanceId,
  });
};

/**
 * Mutation hook for saving guide changes to the server
 * Handles both Counter and Deck guides
 */
export const useSaveGuide = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SaveArchetypeGuideResponse,
    Error,
    {
      archetypeId: number;
      guideType: GuideType;
      cardPairs?: CardPairDTO[];
      initialHands?: Array<{
        cardIds: number[];
        description?: string;
        finalBoard?: FinalBoardDTO;
      }>;
      title: string;
      headerCardId?: number;
      generalTip?: string;
      instanceId?: number;
      comboSteps?: Array<{
        initialHandId: number;
        steps: Array<{
          mainCardIds: number[];
          subCardIds: number[];
          description?: string;
          stepOrder: number;
        }>;
      }>;
    }
  >({
    mutationFn: ({
      archetypeId,
      guideType,
      cardPairs,
      initialHands,
      title,
      headerCardId,
      generalTip,
      instanceId,
      comboSteps,
    }) =>
      saveArchetypeGuide(
        archetypeId,
        guideType,
        cardPairs,
        initialHands,
        title,
        headerCardId,
        generalTip,
        instanceId,
        comboSteps,
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
