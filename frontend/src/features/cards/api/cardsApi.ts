import { axiosClient } from "@/lib/http";
import type { Card, CardsSearchParams, CardsSearchResponse } from "../types";

const ITEMS_PER_PAGE = 30;

/**
 * Search cards with pagination
 */
export const searchCardsWithPagination = async (
  params: CardsSearchParams
): Promise<CardsSearchResponse> => {
  const response = await axiosClient.get<{ results: Card[] }>(
    "/api/cards/search",
    {
      params: { query: params.query },
    }
  );

  const allCards = response.data.results;
  const total = allCards.length;
  const totalPages = Math.ceil(total / params.limit);
  
  // Client-side pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const cards = allCards.slice(startIndex, endIndex);

  return {
    cards,
    total,
    page: params.page,
    totalPages,
  };
};

export { ITEMS_PER_PAGE };
