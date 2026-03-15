import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

export interface RecommendedDeck {
  id: number;
  instanceId: number;
  title?: string;
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

export const recommendedDeckApi = {
  // Get recommended deck for an instance
  getDeck: async (instanceId: number): Promise<RecommendedDeck | null> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/instances/${instanceId}/recommended-deck`,
        { withCredentials: true }
      );
      return response.data.deck;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // No deck exists
      }
      throw error;
    }
  },

  // Create or update recommended deck
  saveRecommendedDeck: async (
    instanceId: number,
    title: string | undefined,
    mainDeckCards: number[],
    extraDeckCards: number[]
  ): Promise<RecommendedDeck> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/instances/${instanceId}/recommended-deck`,
      { title, mainDeckCards, extraDeckCards },
      { withCredentials: true }
    );
    return response.data.deck;
  },

  // Delete recommended deck
  deleteRecommendedDeck: async (instanceId: number): Promise<void> => {
    await axios.delete(
      `${API_BASE_URL}/api/instances/${instanceId}/recommended-deck`,
      { withCredentials: true }
    );
  },
};
