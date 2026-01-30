import { axiosClient } from "@/lib/http";

export interface CardSearchResult {
  id: number;
  name: string;
  imageUrlExternal?: string;
  imageUrlSmallExternal?: string;
}

export interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

// Search for cards by name query
export const searchCards = async (query: string): Promise<CardSearchResult[]> => {
  const response = await axiosClient.get<{ results: CardSearchResult[] }>(
    "/api/cards/search",
    {
      params: { query },
    }
  );
  
  return response.data.results;
};

// Select a card by ID and retrieve its full details including images
export const selectCard = async (cardId: number): Promise<Card> => {
  const response = await axiosClient.post<{ card: Card }>("/api/cards/select", {
    cardId,
  });
  
  return response.data.card;
};

// Confirm multiple cards as permanent (non-temporary) in the database
export const confirmCards = async (cardIds: number[]): Promise<void> => {
  await axiosClient.post("/api/cards/confirm", { cardIds });
};

