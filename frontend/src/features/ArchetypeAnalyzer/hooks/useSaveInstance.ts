import { useState } from "react";
import { confirmCards } from "../api/cardApi";
import { useRegisterArchetype } from "./useArchetypeQueries";
import { recommendedDeckApi } from "@/lib/http/recommendedDeckApi";
import {
  validateInstanceData,
  transformPairsForApi,
} from "../utils/validation";

interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

interface CardPair {
  id: string;
  topCards: Card[];
  bottomCards: Card[];
  effectiveness?: string;
  comment?: string;
}

interface SaveInstanceParams {
  pairs: CardPair[];
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

export const useSaveInstance = () => {
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const registerMutation = useRegisterArchetype();

  const validatePairs = (pairs: CardPair[]): boolean => {
    const validPairs = pairs.filter(
      (p) => p.topCards.length > 0 || p.bottomCards.length > 0,
    );
    
    if (validPairs.length === 0) {
      setValidationError(
        "Please add at least one card (top or bottom) in at least one pair before saving.",
      );
      return false;
    }

    for (let i = 0; i < pairs.length; i++) {
      if (pairs[i].topCards.length === 0 && pairs[i].bottomCards.length === 0) {
        setValidationError(
          `Pair #${i + 1} must have at least one card in Top or Bottom.`,
        );
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const saveInstance = async (params: SaveInstanceParams): Promise<void> => {
    const {
      pairs,
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

    if (!validatePairs(pairs)) {
      return;
    }

    const validPairs = pairs.filter(
      (p) => p.topCards.length > 0 || p.bottomCards.length > 0,
    );

    const validation = validateInstanceData(validPairs, headerCard, title);

    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }

    setSaving(true);

    try {
      const cardPairs = transformPairsForApi(validPairs);

      const allCardIds: number[] = [];

      if (headerCard) {
        allCardIds.push(headerCard.id);
      }

      cardPairs.forEach((pair) => {
        allCardIds.push(...pair.topCardIds, ...pair.bottomCardIds);
      });

      const mainDeckIds = deckMainCards.map((c) => c.id);
      const extraDeckIds = deckExtraCards.map((c) => c.id);

      if (hasDeckContent) {
        allCardIds.push(...mainDeckIds, ...extraDeckIds);
      }

      const uniqueCardIds = [...new Set(allCardIds)];

      await confirmCards(uniqueCardIds);

      // Sanitize only the title (multiple spaces -> single space)
      const sanitizedTitle = title.replace(/\s+/g, " ").trim();
      // generalTip preserves formatting (only trim edges)
      const processedGeneralTip = generalTip.trim();

      const response = await registerMutation.mutateAsync({
        archetypeId,
        cardPairs,
        title: sanitizedTitle,
        headerCardId: headerCard!.id,
        generalTip: processedGeneralTip || undefined,
        instanceId: instanceId,
      });

      // Save or delete recommended deck based on content
      const savedInstanceId = response.instance?.id || instanceId;
      if (savedInstanceId) {
        if (hasDeckContent) {
          await recommendedDeckApi.saveDeck(
            savedInstanceId,
            deckTitle,
            mainDeckIds,
            extraDeckIds,
          );
        } else if (existingDeck) {
          await recommendedDeckApi.deleteDeck(savedInstanceId);
        }
      }

      if (response.instance?.id) {
        window.location.href = `/archetype/${archetypeId}/instance/${response.instance.id}`;
      }
    } catch (error) {
      console.error("Error saving archetype:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register archetype. Please try again.";
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    validationError,
    saveInstance,
  };
};
