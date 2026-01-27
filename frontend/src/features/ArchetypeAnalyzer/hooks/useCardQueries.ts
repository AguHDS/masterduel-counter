import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys, QUERY_STALE_TIME } from "@/lib/query";
import {
  searchCards,
  selectCard,
  confirmCards,
  type CardSearchResult,
  type Card,
} from "../api/cardApi";

/**
 * Hook to search cards
 * Uses SHORT stale time for real-time search with aggressive caching
 */
export const useSearchCards = (query: string) => {
  return useQuery<CardSearchResult[]>({
    queryKey: queryKeys.cards.search(query),
    queryFn: () => searchCards(query),
    staleTime: QUERY_STALE_TIME.SHORT,
    enabled: query.trim().length > 0,
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
