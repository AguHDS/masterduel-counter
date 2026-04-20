import { axiosClient } from "@/lib/http";
import type { Archetype, SearchResponse, Card } from "../types";

/**
 * Get archetype with header card details
 */
export const getArchetypeWithHeaderCard = async (
  archetypeId: string | number,
): Promise<{
  success: boolean;
  archetype: Archetype & {
    header_card_name?: string;
    header_card_image_url?: string;
    header_card_image_url_small?: string;
  };
}> => {
  const response = await axiosClient.get(
    `/api/archetypes/${archetypeId}/with-header`,
  );
  return response.data;
};

/**
 * Search for archetypes by name
 */
export const searchArchetypes = async (
  searchTerm: string,
  limit: number = 50,
): Promise<SearchResponse> => {
  if (!searchTerm || searchTerm.trim() === "") {
    return { data: { archetypes: [] } };
  }

  const response = await axiosClient.get<SearchResponse>(
    "/api/searchArchetype",
    {
      params: {
        name: searchTerm,
        limit,
      },
    },
  );

  return response.data;
};

/** Select a card by ID and retrieve its full details including images */
export const selectCard = async (cardId: number): Promise<Card> => {
  const response = await axiosClient.post<{ card: Card }>("/api/cards/select", {
    cardId,
  });

  return response.data.card;
};

/** Confirm multiple cards as permanent (non-temporary) in the database */
export const confirmCards = async (cardIds: number[]): Promise<void> => {
  await axiosClient.post("/api/cards/confirm", { cardIds });
};
