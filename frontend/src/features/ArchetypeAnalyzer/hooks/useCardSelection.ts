import { useState, useCallback } from "react";
import { searchCards, selectCard, type CardSearchResult, type Card } from "../api/cardApi";

export const useCardSelection = () => {
  const [searchResults, setSearchResults] = useState<CardSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchCards(query);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search cards");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const select = useCallback(async (cardId: number): Promise<Card | null> => {
    setLoading(true);
    setError(null);

    try {
      const card = await selectCard(cardId);
      return card;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select card");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    search,
    select,
    clearSearch,
  };
};
