import { axiosClient } from "@/lib/http";

export interface CardSearchResult {
  id: number;
  name: string;
}

export interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
}

export const searchCards = async (query: string): Promise<CardSearchResult[]> => {
  const response = await axiosClient.get<{ results: CardSearchResult[] }>(
    "/api/cards/search",
    {
      params: { query },
    }
  );
  
  return response.data.results;
};

export const selectCard = async (cardId: number): Promise<Card> => {
  const response = await axiosClient.post<{ card: Card }>("/api/cards/select", {
    cardId,
  });
  
  return response.data.card;
};

export const confirmCards = async (cardIds: number[]): Promise<void> => {
  await axiosClient.post("/api/cards/confirm", { cardIds });
};

