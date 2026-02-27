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

export const instanceApi = {
  // Get all user instances for a specific archetype
  getInstancesByArchetypeId: async (
    archetypeId: number,
    sortBy: 'likes' | 'updated' = 'updated'
  ): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances`,
      { params: { sortBy } }
    );
    return response.data;
  },

  /** Get all archetype instances created by a specific user (for user profile) */
  getInstancesByUserId: async (
    userId: string,
    sortBy: 'likes' | 'updated' = 'updated'
  ): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/${userId}/instances`,
      { params: { sortBy } }
    );
    return response.data;
  },

  /** Search guide instances by archetype ID and title */
  searchInstancesByArchetypeId: async (
    archetypeId: number,
    title: string,
    sortBy: 'likes' | 'updated' = 'updated'
  ): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/search`,
      { params: { title, sortBy } }
    );
    return response.data;
  },

  /** Search guide instances by user ID and title */
  searchInstancesByUserId: async (
    userId: string,
    title: string,
    sortBy: 'likes' | 'updated' = 'updated'
  ): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/${userId}/instances/search`,
      { params: { title, sortBy } }
    );
    return response.data;
  },

  /** Get instance by its ID */
  getInstanceById: async (instanceId: number): Promise<UserInstanceWithCardPairs> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/instances/${instanceId}`
    );
    return response.data;
  },

  /** Create a new instance or update an existing instance with a header card */
  createOrUpdateInstance: async (
    archetypeId: number,
    data: { title: string; headerCardId: number | null; generalTip?: string | null }
  ): Promise<{ instance: ArchetypeInstanceWithDetails }> => {
    const response = await axios.post<{ instance: ArchetypeInstanceWithDetails }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances`,
      data,
      { withCredentials: true }
    );
    return response.data;
  },

  /** 
   * Delete an instance guide by its ID (with ownership verification)
   */
  deleteInstance: async (instanceId: number): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete<{ success: boolean; message: string }>(
      `${API_BASE_URL}/api/instances/${instanceId}`,
      { withCredentials: true }
    );
    return response.data;
  },

  // Toggle like on an instance (add if not exists, remove if exists)
  toggleInstanceLike: async (archetypeId: number, instanceId: number): Promise<{ success: boolean; liked: boolean; likes: number }> => {
    const response = await axios.post<{ success: boolean; liked: boolean; likes: number }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/like`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  // Check if current user has liked an instance
  getInstanceLikeStatus: async (archetypeId: number, instanceId: number): Promise<{ success: boolean; liked: boolean }> => {
    const response = await axios.get<{ success: boolean; liked: boolean }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/like/status`,
      { withCredentials: true }
    );
    return response.data;
  },

  // Toggle favorite on an instance (add if not exists, remove if exists)
  toggleInstanceFavorite: async (archetypeId: number, instanceId: number): Promise<{ success: boolean; favorited: boolean; favorites: number }> => {
    const response = await axios.post<{ success: boolean; favorited: boolean; favorites: number }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/favorite`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  // Check if current user has favorited an instance
  getInstanceFavoriteStatus: async (archetypeId: number, instanceId: number): Promise<{ success: boolean; favorited: boolean }> => {
    const response = await axios.get<{ success: boolean; favorited: boolean }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/favorite/status`,
      { withCredentials: true }
    );
    return response.data;
  },

  /**
   * Register a view for an instance
   * No authentication required - tracks all views
   */
  registerView: async (instanceId: number): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post<{ success: boolean; message: string }>(
      `${API_BASE_URL}/api/instances/${instanceId}/view`,
      {}
    );
    return response.data;
  },
};
