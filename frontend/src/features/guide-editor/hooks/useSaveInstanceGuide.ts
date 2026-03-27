import { useState } from "react";
import { confirmCards } from "@/features/archetypes/api/archetypesApi";
import { useSaveGuide } from "./useArchetypeQueries";
import {
  saveRecommendedDeck,
  deleteRecommendedDeck,
} from "../api/guideEditorApi";
import {
  validateInstanceData,
  transformPairsForApi,
} from "../utils/validation";
import type { CardPair, Card, GuideType } from "@/features/archetypes/types";
import type { InitialHand } from "../components/InitialHandsEditor";

interface SaveInstanceParams {
  pairs: CardPair[];
  initialHands: InitialHand[];
  guideType: GuideType;
  title: string;
  generalTip: string;
  headerCard: { id: number; name: string; imageUrl: string } | null;
  archetypeId: number;
  instanceId?: number;
  deckTitle: string;
  deckMainCards: Card[];
  deckExtraCards: Card[];
  hasDeckContent: boolean;
  existingDeck: boolean;
}

export const useSaveInstanceGuide = () => {
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const saveGuideMutation = useSaveGuide();

  const validatePairs = (pairs: CardPair[], guideType: GuideType): boolean => {
    // COUNTER guides require at least one card pair
    if (guideType === "COUNTER") {
      const validPairs = pairs.filter(
        (p) => p.topCards.length > 0 || p.bottomCards.length > 0,
      );

      if (validPairs.length === 0) {
        setValidationError(
          "Counter Guides require at least one card pair. Please add at least one card (top or bottom) in at least one pair before saving.",
        );
        return false;
      }

      // Only validate non-empty pairs (empty ones are ignored)
      // Users might have created placeholder pairs they haven't filled yet
    }

    setValidationError(null);
    return true;
  };

  const validateInitialHands = (initialHands: InitialHand[], guideType: GuideType): boolean => {
    // DECK guides require at least one initial hand
    if (guideType === "DECK") {
      const validHands = initialHands.filter((h) => h.cards.length > 0);

      if (validHands.length === 0) {
        setValidationError(
          "Deck Guides require at least one initial hand. Please add at least one card in at least one initial hand before saving.",
        );
        return false;
      }

      // Only validate non-empty initial hands (empty ones are ignored)
      // Users might have placeholder hands they haven't filled yet
    }

    setValidationError(null);
    return true;
  };

  const saveInstance = async (params: SaveInstanceParams): Promise<void> => {
    const {
      pairs,
      initialHands,
      guideType,
      title,
      generalTip,
      headerCard,
      archetypeId,
      instanceId,
      deckTitle,
      deckMainCards,
      deckExtraCards,
      hasDeckContent,
      existingDeck,
    } = params;

    // Validate based on guide type
    if (guideType === "COUNTER") {
      if (!validatePairs(pairs, guideType)) {
        return;
      }
    } else if (guideType === "DECK") {
      if (!validateInitialHands(initialHands, guideType)) {
        return;
      }
    }

    const validPairs = guideType === "COUNTER" 
      ? pairs.filter((p) => p.topCards.length > 0 || p.bottomCards.length > 0)
      : [];

    const validation = validateInstanceData(validPairs, headerCard, title, guideType);

    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }

    setSaving(true);

    try {
      const cardPairs = guideType === "COUNTER" ? transformPairsForApi(validPairs) : [];

      const allCardIds: number[] = [];

      if (headerCard) {
        allCardIds.push(headerCard.id);
      }

      // Add card pair IDs for COUNTER guides
      if (guideType === "COUNTER") {
        cardPairs.forEach((pair) => {
          allCardIds.push(...pair.topCardIds, ...pair.bottomCardIds);
        });
      }

      // Add initial hand card IDs for DECK guides (only non-empty hands)
      if (guideType === "DECK") {
        const validHands = initialHands.filter((h) => h.cards.length > 0);
        validHands.forEach((hand) => {
          allCardIds.push(...hand.cards.map((c) => c.id));
        });
      }

      const mainDeckIds = deckMainCards.map((c) => c.id);
      const extraDeckIds = deckExtraCards.map((c) => c.id);

      if (hasDeckContent) {
        allCardIds.push(...mainDeckIds, ...extraDeckIds);
      }

      const uniqueCardIds = [...new Set(allCardIds)];

      await confirmCards(uniqueCardIds);

      // Sanitize only the title (multiple spaces -> single space)
      const sanitizedTitle = title.replace(/\s+/g, " ").trim();
      // Optional Comment preserves formatting (only trim edges)
      const processedGeneralTip = generalTip.trim();

      // Transform initial hands for API (only non-empty hands)
      const initialHandsForApi = guideType === "DECK" 
        ? initialHands
            .filter((hand) => hand.cards.length > 0)
            .map((hand) => ({
              cardIds: hand.cards.map((c) => c.id),
            }))
        : undefined;

      const response = await saveGuideMutation.mutateAsync({
        archetypeId,
        guideType,
        cardPairs: guideType === "COUNTER" ? cardPairs : [],
        initialHands: guideType === "DECK" && initialHandsForApi ? initialHandsForApi : [],
        title: sanitizedTitle,
        headerCardId: headerCard!.id,
        generalTip: processedGeneralTip || undefined,
        instanceId: instanceId,
      });

      // Save or delete recommended deck based on content
      const savedInstanceId = response.instance?.id || instanceId;
      if (savedInstanceId) {
        if (hasDeckContent) {
          await saveRecommendedDeck(
            savedInstanceId,
            deckTitle,
            mainDeckIds,
            extraDeckIds,
          );
        } else if (existingDeck) {
          await deleteRecommendedDeck(savedInstanceId);
        }
      }

      if (response.instance?.id) {
        window.location.href = `/archetype/${archetypeId}/instance/${response.instance.id}`;
      }
    } catch (error) {
      console.error("Error saving guide:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register guide. Please try again.";
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const clearValidationError = () => {
    setValidationError(null);
  };

  return {
    saving,
    validationError,
    saveInstance,
    clearValidationError,
  };
};
