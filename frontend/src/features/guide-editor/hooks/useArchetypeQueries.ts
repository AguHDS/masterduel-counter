import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import {
  saveArchetypeGuide,
  saveDraftGuide,
  deleteDraftGuide,
  getInstanceGuideById,
  type SaveArchetypeGuideResponse,
  type SaveDraftResponse,
  type CardPairDTO,
  type FinalBoardDTO,
  type ComboStepsDTO,
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
      draftInstanceId?: number;
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
      draftInstanceId,
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
        draftInstanceId,
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

/**
 * Mutation hook for saving a draft guide
 */
export const useSaveDraft = () => {
  return useMutation<
    SaveDraftResponse,
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
      title?: string;
      headerCardId?: number | null;
      generalTip?: string | null;
      comboSteps?: ComboStepsDTO[];
      draftInstanceId?: number;
      isGuideRequest?: boolean;
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
      comboSteps,
      draftInstanceId,
      isGuideRequest,
    }) =>
      saveDraftGuide(
        archetypeId,
        guideType,
        cardPairs,
        initialHands,
        title,
        headerCardId,
        generalTip,
        comboSteps,
        draftInstanceId,
        isGuideRequest,
      ),
  });
};

/**
 * Mutation hook for deleting a draft guide
 */
export const useDeleteDraft = () => {
  return useMutation<
    { success: boolean; message: string },
    Error,
    { draftId: number }
  >({
    mutationFn: ({ draftId }) => deleteDraftGuide(draftId),
  });
};
