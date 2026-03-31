import { useQuery } from "@tanstack/react-query";
import { searchCardsWithPagination, ITEMS_PER_PAGE } from "../api/cardsApi";

interface UseCardsSearchOptions {
  query: string;
  page: number;
  enabled?: boolean;
}

export const useCardsSearch = ({ query, page, enabled = true }: UseCardsSearchOptions) => {
  return useQuery({
    queryKey: ["cards-search", query, page],
    queryFn: () =>
      searchCardsWithPagination({
        query,
        page,
        limit: ITEMS_PER_PAGE,
      }),
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
