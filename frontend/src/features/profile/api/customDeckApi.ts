import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

export interface CustomDeck {
  id: number;
  userId: string;
  title: string;
  isPublic: boolean;
  mainDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  extraDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
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
    isPublic: boolean = false
  ): Promise<CustomDeck> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/users/${userId}/custom-decks`,
      { title, mainDeckCards, extraDeckCards, isPublic },
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
    isPublic?: boolean
  ): Promise<CustomDeck> => {
    const response = await axios.put(
      `${API_BASE_URL}/api/users/${userId}/custom-decks/${deckId}`,
      { title, mainDeckCards, extraDeckCards, isPublic },
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
};
