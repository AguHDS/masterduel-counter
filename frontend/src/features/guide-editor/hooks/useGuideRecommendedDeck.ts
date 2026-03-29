import { useState, useEffect } from "react";
import {
  getRecommendedDeck,
  saveRecommendedDeck,
  deleteRecommendedDeck,
  type RecommendedDeck,
} from "../api/guideEditorApi";

export const useGuideRecommendedDeck = (instanceId: number | undefined) => {
  const [deck, setDeck] = useState<RecommendedDeck | null>(null);
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!instanceId) return;

    const loadDeck = async () => {
      setIsLoading(true);
      try {
        const deckData = await getRecommendedDeck(instanceId);
        setDeck(deckData);
      } catch (error) {
        console.error(
          "Error loading recommended deck:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDeck();
  }, [instanceId]);

  const handleSaveRecommendedDeck = async (
    title: string | undefined,
    mainDeckIds: number[],
    extraDeckIds: number[],
  ) => {
    if (!instanceId) return;

    try {
      const savedDeck = await saveRecommendedDeck(
        instanceId,
        title,
        mainDeckIds,
        extraDeckIds,
      );
      setDeck(savedDeck);
      setIsEditingDeck(false);
    } catch (error) {
      console.error("Error saving recommended deck:", error);
      throw error;
    }
  };

  const handleDeleteRecommendedDeck = async () => {
    if (!instanceId) return;

    try {
      // Only call API if deck exists in database
      if (deck !== null) {
        await deleteRecommendedDeck(instanceId);
      }
      setDeck(null);
      setIsEditingDeck(false);
    } catch (error) {
      console.error("Error deleting recommended deck:", error);
      throw error;
    }
  };

  return {
    deck,
    isEditingDeck,
    isLoading,
    setIsEditingDeck,
    saveRecommendedDeck: handleSaveRecommendedDeck,
    deleteRecommendedDeck: handleDeleteRecommendedDeck,
  };
};
