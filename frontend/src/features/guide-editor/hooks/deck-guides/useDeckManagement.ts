import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { Card } from "@/features/archetypes/types";

interface DeckData {
  title?: string;
  mainDeck: Card[];
  extraDeck: Card[];
  sideDeck: Card[];
}

interface UseDeckManagementParams {
  recommendedDeck: {
    deck: DeckData | null;
    deleteRecommendedDeck: () => Promise<void>;
  };
  isEditMode: boolean;
  isOwner: boolean;
}

/**
 * Manages recommended deck state, visibility, and edit/view mode synchronization
 * 
 * Handles:
 * - Deck state (title, main/extra/side cards)
 * - Visibility toggle (showRecommendedDeck)
 * - Edit mode: Backup/restore deck state when entering/exiting edit
 * - View mode: Sync deck state from server
 * - Delete operations (local hide in edit mode, server delete in view mode)
 * 
 * The deck is optional and only for Deck Guides
 */
export const useDeckManagement = ({
  recommendedDeck,
  isEditMode,
  isOwner,
}: UseDeckManagementParams) => {
  // Memoize deck arrays to prevent unnecessary re-renders
  const memoizedMainDeck = useMemo(
    () => recommendedDeck.deck?.mainDeck || [],
    [recommendedDeck.deck?.mainDeck],
  );
  const memoizedExtraDeck = useMemo(
    () => recommendedDeck.deck?.extraDeck || [],
    [recommendedDeck.deck?.extraDeck],
  );
  const memoizedSideDeck = useMemo(
    () => recommendedDeck.deck?.sideDeck || [],
    [recommendedDeck.deck?.sideDeck],
  );

  // Local deck state (editable)
  const [deckTitle, setDeckTitle] = useState<string>(
    recommendedDeck.deck?.title || "Recommended Deck",
  );
  const [deckMainCards, setDeckMainCards] = useState<Card[]>(memoizedMainDeck);
  const [deckExtraCards, setDeckExtraCards] = useState<Card[]>(memoizedExtraDeck);
  const [deckSideCards, setDeckSideCards] = useState<Card[]>(memoizedSideDeck);
  
  // Track whether initial auto-show has happened (prevents re-show after user deletion)
  const initialAutoShowDone = useRef(false);

  // Deck visibility and backup state
  const [showRecommendedDeck, setShowRecommendedDeck] = useState(false);
  const [originalDeckState, setOriginalDeckState] = useState<{
    exists: boolean;
    title: string;
    mainCards: Card[];
    extraCards: Card[];
    sideCards: Card[];
  } | null>(null);

  /**
   * Updates all deck state at once
   * Used by deck editor component when user makes changes
   */
  const handleDeckChange = useCallback(
    (
      title: string,
      mainDeck: Card[],
      extraDeck: Card[],
      sideDeck: Card[],
    ) => {
      setDeckTitle(title);
      setDeckMainCards(mainDeck);
      setDeckExtraCards(extraDeck);
      setDeckSideCards(sideDeck);
    },
    [],
  );

  /**
   * Deletes or hides the recommended deck based on current mode
   * 
   * - Edit mode: Only hides the deck locally (allows canceling)
   * - View mode: Actually deletes from server
   */
  const handleDeleteDeck = useCallback(async () => {
    initialAutoShowDone.current = true;
    if (isEditMode && isOwner) {
      // In edit mode, only hide locally
      setShowRecommendedDeck(false);
      setDeckTitle("Recommended Deck");
      setDeckMainCards([]);
      setDeckExtraCards([]);
      setDeckSideCards([]);
    } else {
      // In view mode, delete from server
      await recommendedDeck.deleteRecommendedDeck();
      setShowRecommendedDeck(false);
    }
  }, [recommendedDeck, isEditMode, isOwner]);

  // Effect: Save/clear original deck state when entering/exiting edit mode
  useEffect(() => {
    // Save original deck state when entering edit mode
    if (isEditMode && isOwner && !originalDeckState) {
      setOriginalDeckState({
        exists: !!recommendedDeck.deck,
        title: deckTitle,
        mainCards: [...deckMainCards],
        extraCards: [...deckExtraCards],
        sideCards: [...deckSideCards],
      });
    }

    // Clear original deck state when exiting edit mode (after save)
    if (!isEditMode && originalDeckState) {
      setOriginalDeckState(null);
    }
  }, [
    isEditMode,
    isOwner,
    originalDeckState,
    recommendedDeck.deck,
    deckTitle,
    deckMainCards,
    deckExtraCards,
    deckSideCards,
  ]);

  // Sync deck state from server when not editing
  useEffect(() => {
    if (!isEditMode || !isOwner) {
      setDeckTitle(recommendedDeck.deck?.title || "Recommended Deck");
      setDeckMainCards(recommendedDeck.deck?.mainDeck || []);
      setDeckExtraCards(recommendedDeck.deck?.extraDeck || []);
      setDeckSideCards(recommendedDeck.deck?.sideDeck || []);
    } else if (recommendedDeck.deck === null) {
      setDeckTitle("Recommended Deck");
      setDeckMainCards([]);
      setDeckExtraCards([]);
      setDeckSideCards([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedDeck.deck, isEditMode, isOwner]);

  // Show deck automatically in view mode if it exists
  useEffect(() => {
    if (!isEditMode && recommendedDeck.deck) {
      setShowRecommendedDeck(true);
    }
  }, [isEditMode, recommendedDeck.deck]);

  // Show deck in edit mode if it exists (only once, respects user deletion)
  useEffect(() => {
    if (
      isEditMode &&
      isOwner &&
      recommendedDeck.deck &&
      !showRecommendedDeck &&
      !initialAutoShowDone.current
    ) {
      initialAutoShowDone.current = true;
      setShowRecommendedDeck(true);
    }
  }, [recommendedDeck.deck, isEditMode, isOwner, showRecommendedDeck]);

  return {
    deckTitle,
    deckMainCards,
    deckExtraCards,
    deckSideCards,
    showRecommendedDeck,
    originalDeckState,
    setDeckTitle,
    setDeckMainCards,
    setDeckExtraCards,
    setDeckSideCards,
    setShowRecommendedDeck,
    setOriginalDeckState,
    handleDeckChange,
    handleDeleteDeck,
    hasRecommendedDeckFromServer: !!recommendedDeck.deck,
  };
};
