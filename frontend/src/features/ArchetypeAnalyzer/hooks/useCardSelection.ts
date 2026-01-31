import { useState, useCallback } from "react";
import { useSearchCards, useSelectCard } from "./useCardQueries";
import type { Card } from "../api/cardApi";

export const useCardSelection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: searchResults = [], isLoading, error } = useSearchCards(searchQuery);
  const selectMutation = useSelectCard();

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const select = useCallback(async (cardId: number): Promise<Card | null> => {
    try {
      return await selectMutation.mutateAsync(cardId);
    } catch (err) {
      console.error("Failed to select card:", err);
      return null;
    }
  }, [selectMutation]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchResults,
    loading: isLoading || selectMutation.isPending,
    error: error?.message || selectMutation.error?.message || null,
    search,
    select,
    clearSearch,
  };
};
