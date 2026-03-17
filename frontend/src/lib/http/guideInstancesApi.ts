import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

export interface GuideListItem {
  id: number;
  archetypeId: number;
  userId: string;
  title: string;
  headerCardId: number | null;
  generalTip?: string | null;
  likes: number;
  favorites: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  archetypeName: string;
  userName: string;
  userProfilePictureUrl?: string | null;
  headerCardName?: string;
  headerCardImageUrl?: string;
}

export interface GuideInstanceWithFullDetails {
  instance: {
    id: number;
    archetypeId: number;
    userId: string;
    title: string;
    headerCardId: number | null;
    generalTip?: string | null;
    likes: number;
    favorites: number;
    views: number;
    createdAt: string;
    updatedAt: string;
  };
  userName: string;
  userProfilePictureUrl: string | null;
  archetypeName: string;
  headerCard: {
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  } | null;
  cardPairs: Array<{
    id: number;
    topCards: Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
      imageUrlCropped: string;
    }>;
    bottomCards: Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
      imageUrlCropped: string;
    }>;
    effectiveness?: string;
    comment?: string;
  }>;
}

/** Centralized API for guide related operations (reusable operations) */
export const guideInstancesApi = {
  /** Toggle favorite on a guide (add if not exists, remove if exists) */
  toggleFavoriteGuide: async (
    archetypeId: number,
    instanceId: number,
  ): Promise<{ success: boolean; favorited: boolean; favorites: number }> => {
    const response = await axios.post<{
      success: boolean;
      favorited: boolean;
      favorites: number;
    }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/favorite`,
      {},
      { withCredentials: true },
    );
    return response.data;
  },

  /**
   * Register a view count for a guide
   */
  registerView: async (
    instanceId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post<{ success: boolean; message: string }>(
      `${API_BASE_URL}/api/instances/${instanceId}/view`,
      {},
    );
    return response.data;
  },

  /**
   * Get the latest created guides across all archetypes
   * @param limit - Number of instances to fetch (default: 5, max: 50)
   */
  getLatestCreatedGuides: async (
    limit: number = 5,
  ): Promise<GuideListItem[]> => {
    const response = await axios.get<GuideListItem[]>(
      `${API_BASE_URL}/api/guides/latest`,
      { params: { limit } },
    );
    return response.data;
  },
};
