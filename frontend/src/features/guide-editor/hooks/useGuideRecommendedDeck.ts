import { useState, useEffect } from "react";
import { recommendedDeckApi, type RecommendedDeck } from "@/lib/http/recommendedDeckApi";

export const useGuideRecommendedDeck = (instanceId: number | undefined) => {
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
        console.error("useGuideRecommendedDeck Error loading recommended deck:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeck();
  }, [instanceId]);

  const saveRecommendedDeck = async (title: string | undefined, mainDeckIds: number[], extraDeckIds: number[]) => {
    if (!instanceId) return;

    try {
      const savedDeck = await recommendedDeckApi.saveRecommendedDeck(instanceId, title, mainDeckIds, extraDeckIds);
      setDeck(savedDeck);
      setIsEditingDeck(false);
    } catch (error) {
      console.error("Error saving deck:", error);
      throw error;
    }
  };

  const deleteRecommendedDeck = async () => {
    if (!instanceId) return;

    try {
      await recommendedDeckApi.deleteRecommendedDeck(instanceId);
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
    saveRecommendedDeck,
    deleteRecommendedDeck,
  };
};
