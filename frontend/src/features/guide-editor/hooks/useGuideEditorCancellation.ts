import { useCallback } from "react";
import type { CardPair, Card, ComboStep, GuideType } from "@/features/archetypes/types";
import type { GuideInstanceWithFullDetails } from "@/lib/http/guideInstancesApi";
import type { InitialHand } from "../components/deck-guides/InitialHandsEditor";
import { useCancelTakeGuideRequest } from "@/features/guide-request";
import {
  mapGuideCardPairsToEditorPairs,
  mapInitialHandsAndComboStepsFromInstance,
} from "../utils/guideContainerTransforms";
import { UNSAVED_CHANGES_WARNING } from "../utils/validation";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlCropped: string;
}

interface CounterGuideInstanceData {
  cardPairs: Array<{
    id: number;
    pairSection?: "HANDTRAP" | "BOARD_BREAKER" | null;
    topCards: Card[];
    bottomCards: Card[];
    comment?: string;
  }>;
  instance: {
    id: number;
    title: string;
    generalTip?: string | null;
    likes: number;
    favorites: number;
    guideType: GuideType;
  };
  headerCard?: HeaderCard | null;
  initialHands?: unknown; // Accept server format, will be transformed
}

interface UseGuideEditorCancellationParams {
  isCreatingNew: boolean;
  guideInstanceData?: CounterGuideInstanceData;
  confirmDiscardIfDirty: (message: string) => boolean;
  clearValidationError: () => void;
  navigate: (delta: number) => void;
  guideRequestId: number | null;
  draftInstanceId?: number;
  
  // Editor state setters
  setIsEditMode: (value: boolean) => void;
  resetEditorToInitialData: (data: {
    pairs?: CardPair[];
    title: string;
    generalTip: string;
    headerCard: HeaderCard | null;
  }) => void;
  
  // Counter guide state
  setPairs: React.Dispatch<React.SetStateAction<CardPair[]>>;
  
  // Deck guide state
  setInitialHands: React.Dispatch<React.SetStateAction<InitialHand[]>>;
  setComboSteps: React.Dispatch<React.SetStateAction<Map<string, ComboStep[]>>>;
  setSelectedHandId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedHandId: string | null;
  setShowComboFlow: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Deck management (from useDeckManagement hook)
  deckManagement: {
    originalDeckState: {
      exists: boolean;
      title: string;
      mainCards: Card[];
      extraCards: Card[];
      sideCards: Card[];
    } | null;
    setDeckTitle: (title: string) => void;
    setDeckMainCards: (cards: Card[]) => void;
    setDeckExtraCards: (cards: Card[]) => void;
    setDeckSideCards: (cards: Card[]) => void;
    setShowRecommendedDeck: (show: boolean) => void;
    setOriginalDeckState: (state: {
      exists: boolean;
      title: string;
      mainCards: Card[];
      extraCards: Card[];
      sideCards: Card[];
    } | null) => void;
  };
  
  recommendedDeck: {
    deck: {
      title?: string;
      mainDeck: Card[];
      extraDeck: Card[];
      sideDeck: Card[];
    } | null;
  };
}

/**
 * Handles cancellation logic for guide editing, restoring all state to server values
 * For new guide creation (not saved yet), navigates back instead of restoring
 */
export const useGuideEditorCancellation = ({
  isCreatingNew,
  guideInstanceData,
  confirmDiscardIfDirty,
  clearValidationError,
  navigate,
  setIsEditMode,
  resetEditorToInitialData,
  setPairs,
  setInitialHands,
  setComboSteps,
  setSelectedHandId,
  selectedHandId,
  setShowComboFlow,
  deckManagement,
  recommendedDeck,
  guideRequestId,
  draftInstanceId,
}: UseGuideEditorCancellationParams) => {
  const cancelTakeMutation = useCancelTakeGuideRequest();

  const handleCancel = useCallback(() => {
    if (!confirmDiscardIfDirty(UNSAVED_CHANGES_WARNING)) {
      return;
    }

    setIsEditMode(false);
    clearValidationError();

    if (!isCreatingNew && guideInstanceData) {
      // Restore Counter guide state
      const pairs: CardPair[] = mapGuideCardPairsToEditorPairs(
        guideInstanceData.cardPairs,
      );

      const sanitizedTitle =
        guideInstanceData.instance.title?.replace(/\s+/g, " ").trim() ||
        "Title";
      const generalTip = guideInstanceData.instance.generalTip || "";

      // Restore recommended deck state 
      if (deckManagement.originalDeckState) {
        deckManagement.setDeckTitle(deckManagement.originalDeckState.title);
        deckManagement.setDeckMainCards(deckManagement.originalDeckState.mainCards);
        deckManagement.setDeckExtraCards(deckManagement.originalDeckState.extraCards);
        deckManagement.setDeckSideCards(deckManagement.originalDeckState.sideCards);
        deckManagement.setShowRecommendedDeck(deckManagement.originalDeckState.exists);
        deckManagement.setOriginalDeckState(null);
      } else {
        // Fallback to current server state
        deckManagement.setDeckTitle(recommendedDeck.deck?.title || "Recommended Deck");
        deckManagement.setDeckMainCards(recommendedDeck.deck?.mainDeck || []);
        deckManagement.setDeckExtraCards(recommendedDeck.deck?.extraDeck || []);
        deckManagement.setDeckSideCards(recommendedDeck.deck?.sideDeck || []);
        deckManagement.setShowRecommendedDeck(!!recommendedDeck.deck);
      }

      // Restore shared editor state 
      resetEditorToInitialData({
        pairs,
        title: sanitizedTitle,
        generalTip: generalTip,
        headerCard: guideInstanceData.headerCard
          ? {
              id: guideInstanceData.headerCard.id,
              name: guideInstanceData.headerCard.name,
              imageUrl: guideInstanceData.headerCard.imageUrl,
              imageUrlCropped: guideInstanceData.headerCard.imageUrlCropped,
            }
          : null,
      });

      setPairs(pairs);

      // Restore Deck guide state
      if (
        guideInstanceData.instance.guideType === "DECK" &&
        guideInstanceData.initialHands
      ) {
        const { initialHands: transformedHands, comboSteps: comboStepsMap } =
          mapInitialHandsAndComboStepsFromInstance(
            guideInstanceData.initialHands as GuideInstanceWithFullDetails["initialHands"],
          );

        setInitialHands(transformedHands);
        setComboSteps(comboStepsMap);

        // Restore selected hand and show combo flow if it has steps
        if (transformedHands.length > 0 && !selectedHandId) {
          setSelectedHandId(transformedHands[0].id);
          // Show combo flow if first hand has combo steps
          if (
            comboStepsMap.has(transformedHands[0].id.toString()) &&
            comboStepsMap.get(transformedHands[0].id.toString())!.length > 0
          ) {
            setShowComboFlow(true);
          }
        }
      } else {
        // Clear Deck guide state for Counter guides
        setInitialHands([]);
        setComboSteps(new Map());
        setSelectedHandId(null);
      }
    } else {
      // If creating a new guide from a request with no draft saved yet, release the request
      if (guideRequestId && !draftInstanceId) {
        cancelTakeMutation.mutate(guideRequestId);
      }
      // New guide that hasn't been saved yet - navigate back
      navigate(-1);
    }
  }, [
    isCreatingNew,
    guideInstanceData,
    confirmDiscardIfDirty,
    clearValidationError,
    navigate,
    setIsEditMode,
    resetEditorToInitialData,
    setPairs,
    setInitialHands,
    setComboSteps,
    setSelectedHandId,
    selectedHandId,
    setShowComboFlow,
    deckManagement,
    recommendedDeck,
    guideRequestId,
    draftInstanceId,
    cancelTakeMutation,
  ]);

  return {
    handleCancel,
  };
};
