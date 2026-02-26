import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys, QUERY_STALE_TIME } from "@/lib/query";
import {
  searchCards,
  selectCard,
  confirmCards,
  type CardSearchResult,
  type Card,
} from "../api/cardApi";

interface UseSearchCardsOptions {
  enabled?: boolean;
}

/**
 * Hook to search cards
 * Uses SHORT stale time for real-time search with aggressive caching
 */
export const useSearchCards = (query: string, options?: UseSearchCardsOptions) => {
  const trimmedQuery = query.trim();
  
  return useQuery<CardSearchResult[]>({
    queryKey: queryKeys.cards.search(query),
    queryFn: () => searchCards(query),
    staleTime: QUERY_STALE_TIME.SHORT,
    enabled: options?.enabled !== undefined ? options.enabled : trimmedQuery.length > 0,
  });
};

/**
 * Hook to select a card (creates temporary card in DB)
 */
export const useSelectCard = () => {
  return useMutation<Card, Error, number>({
    mutationFn: selectCard,
  });
};

/**
 * Hook to confirm cards (converts temporary cards to permanent)
 */
export const useConfirmCards = () => {
  return useMutation<void, Error, number[]>({
    mutationFn: confirmCards,
  });
};