const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
  const response = await fetch(`${API_URL}/api/cards/search?query=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error("Failed to search cards");
  }
  
  const data = await response.json();
  return data.results;
};

export const selectCard = async (cardId: number): Promise<Card> => {
  const response = await fetch(`${API_URL}/api/cards/select`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cardId }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to select card");
  }
  
  const data = await response.json();
  return data.card;
};

export const confirmCards = async (cardIds: number[]): Promise<void> => {
  const response = await fetch(`${API_URL}/api/cards/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cardIds }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to confirm cards");
  }
};
