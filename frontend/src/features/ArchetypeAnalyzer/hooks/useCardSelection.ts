import { useState, useEffect } from "react";
import { useSearchCards, useSelectCard } from "./useCardQueries";
import type { Card } from "../api/cardApi";

export const useCardSelection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  const { data: searchResults = [], isLoading, error } = useSearchCards(debouncedQuery);
  const selectMutation = useSelectCard();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const search = (query: string) => {
    setSearchQuery(query);
  };

  const select = async (cardId: number): Promise<Card | null> => {
    try {
      return await selectMutation.mutateAsync(cardId);
    } catch (err) {
      console.error("Failed to select card:", err);
      return null;
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  return {
    searchResults,
    loading: isLoading || selectMutation.isPending,
    error: error?.message || selectMutation.error?.message || null,
    search,
    select,
    clearSearch,
  };
};
