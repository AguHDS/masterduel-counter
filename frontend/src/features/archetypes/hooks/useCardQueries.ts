import { useQuery } from "@tanstack/react-query";
import { queryKeys, QUERY_STALE_TIME } from "@/lib/query";
import { searchCards } from "../api/CardApi";
import type { CardSearchResult } from "../api/CardApi";

interface UseSearchCardsOptions {
  enabled?: boolean;
}

/**
 * Hook to search cards
 * Uses SHORT stale time for real-time search with aggressive caching
 */
export const useSearchCards = (
  query: string,
  options?: UseSearchCardsOptions,
) => {
  const trimmedQuery = query.trim();

  return useQuery<CardSearchResult[]>({
    queryKey: queryKeys.cards.search(query),
    queryFn: () => searchCards(query, 50),
    staleTime: QUERY_STALE_TIME.SHORT,
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : trimmedQuery.length > 0,
  });
};
