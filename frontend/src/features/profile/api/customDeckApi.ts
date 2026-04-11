import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

export interface CustomDeck {
  id: number;
  userId: string;
  title: string;
  isPublic: boolean;
  headerCardId?: number;
  displayOrder: number;
  headerCard?: {
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  };
  mainDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
    frameType?: string;
    level?: number;
  }>;
  extraDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
    frameType?: string;
    level?: number;
  }>;
  sideDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
    frameType?: string;
    level?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const customDeckApi = {
  // Get all custom decks for a user
  getDecks: async (userId: string): Promise<CustomDeck[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/${userId}/custom-decks`,
      { withCredentials: true }
    );
    return response.data.decks;
  },

  // Get a specific custom deck
  getDeck: async (userId: string, deckId: number): Promise<CustomDeck> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/${userId}/custom-decks/${deckId}`,
      { withCredentials: true }
    );
    return response.data.deck;
  },

  // Create a new custom deck
  createDeck: async (
    userId: string,
    title: string,
    mainDeckCards: number[],
    extraDeckCards: number[],
    sideDeckCards: number[] = [],
    isPublic: boolean = false,
    headerCardId?: number
  ): Promise<CustomDeck> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/users/${userId}/custom-decks`,
      { title, mainDeckCards, extraDeckCards, sideDeckCards, isPublic, headerCardId },
      { withCredentials: true }
    );
    return response.data.deck;
  },

  // Update a custom deck
  updateDeck: async (
    userId: string,
    deckId: number,
    title?: string,
    mainDeckCards?: number[],
    extraDeckCards?: number[],
    sideDeckCards?: number[],
    isPublic?: boolean,
    headerCardId?: number
  ): Promise<CustomDeck> => {
    const response = await axios.put(
      `${API_BASE_URL}/api/users/${userId}/custom-decks/${deckId}`,
      { title, mainDeckCards, extraDeckCards, sideDeckCards, isPublic, headerCardId },
      { withCredentials: true }
    );
    return response.data.deck;
  },

  // Delete a custom deck
  deleteCustomDeck: async (userId: string, deckId: number): Promise<void> => {
    await axios.delete(
      `${API_BASE_URL}/api/users/${userId}/custom-decks/${deckId}`,
      { withCredentials: true }
    );
  },

  // Reorder custom decks
  reorderDecks: async (
    userId: string,
    deckOrders: { deckId: number; displayOrder: number }[]
  ): Promise<void> => {
    await axios.put(
      `${API_BASE_URL}/api/users/${userId}/custom-decks-reorder`,
      { deckOrders },
      { withCredentials: true }
    );
  },
};
