import { useState, useEffect } from "react";
import { recommendedDeckApi, type RecommendedDeck } from "@/lib/http/recommendedDeckApi";

export const useRecommendedDeck = (instanceId: number | undefined, _isOwner: boolean) => {
  const [deck, setDeck] = useState<RecommendedDeck | null>(null);
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!instanceId) return;

    const loadDeck = async () => {
      setIsLoading(true);
      try {
        const deckData = await recommendedDeckApi.getDeck(instanceId);
        setDeck(deckData);
      } catch (error) {
        console.error("[useRecommendedDeck] Error loading recommended deck:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeck();
  }, [instanceId]);

  const saveDeck = async (title: string | undefined, mainDeckIds: number[], extraDeckIds: number[]) => {
    if (!instanceId) return;

    try {
      const savedDeck = await recommendedDeckApi.saveDeck(instanceId, title, mainDeckIds, extraDeckIds);
      setDeck(savedDeck);
      setIsEditingDeck(false);
    } catch (error) {
      console.error("Error saving deck:", error);
      throw error;
    }
  };

  const deleteDeck = async () => {
    if (!instanceId) return;

    try {
      await recommendedDeckApi.deleteDeck(instanceId);
      setDeck(null);
      setIsEditingDeck(false);
    } catch (error) {
      console.error("Error deleting deck:", error);
      throw error;
    }
  };

  return {
    deck,
    isEditingDeck,
    isLoading,
    setIsEditingDeck,
    saveDeck,
    deleteDeck,
  };
};
