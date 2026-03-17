import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

export interface ArchetypeInstanceWithDetails {
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

export interface UserInstanceWithCardPairs {
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

/** Centralized API for guide-related operations (public operations) */
export const instanceApi = {
  /** Get all guides for the selected archetype */
  getGuidesByArchetypeId: async (
    archetypeId: number,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances`,
      { params: { sortBy } },
    );
    return response.data;
  },

  /** Get all archetype guides created by a specific user (used in user profile) */
  getGuidesByUserId: async (
    userId: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/${userId}/instances`,
      { params: { sortBy } },
    );
    return response.data;
  },

  /** Search guide instances by archetype ID and title */
  searchGuidesByArchetypeId: async (
    archetypeId: number,
    title: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/search`,
      { params: { title, sortBy } },
    );
    return response.data;
  },

  /** Search guide instances by user ID and title */
  searchGuidesByUserId: async (
    userId: string,
    title: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/${userId}/instances/search`,
      { params: { title, sortBy } },
    );
    return response.data;
  },

  /** Get instance guide by its ID */
  getInstanceGuideById: async (
    instanceId: number,
  ): Promise<UserInstanceWithCardPairs> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/instances/${instanceId}`,
    );
    return response.data;
  },

  /** Toggle like on a guide (add if not exists, remove if exists) */
  toggleLike: async (
    archetypeId: number,
    instanceId: number,
  ): Promise<{ success: boolean; liked: boolean; likes: number }> => {
    const response = await axios.post<{
      success: boolean;
      liked: boolean;
      likes: number;
    }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/like`,
      {},
      { withCredentials: true },
    );
    return response.data;
  },

  /** Get like status for a guide */
  getGuideLikeStatus: async (
    archetypeId: number,
    instanceId: number,
  ): Promise<{ success: boolean; liked: boolean }> => {
    const response = await axios.get<{ success: boolean; liked: boolean }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/like/status`,
      { withCredentials: true },
    );
    return response.data;
  },

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

  /** Check if current user has favorited an instance */
  getInstanceFavoriteStatus: async (
    archetypeId: number,
    instanceId: number,
  ): Promise<{ success: boolean; favorited: boolean }> => {
    const response = await axios.get<{ success: boolean; favorited: boolean }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/favorite/status`,
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
  ): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get<ArchetypeInstanceWithDetails[]>(
      `${API_BASE_URL}/api/guides/latest`,
      { params: { limit } },
    );
    return response.data;
  },
};
