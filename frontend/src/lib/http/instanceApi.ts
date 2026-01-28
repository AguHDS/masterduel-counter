import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export interface ArchetypeInstanceWithDetails {
  id: number;
  archetypeId: number;
  userId: string;
  headerCardId: number | null;
  generalTip?: string | null;
  likes: number;
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
    headerCardId: number | null;
    generalTip?: string | null;
    likes: number;
    createdAt: string;
    updatedAt: string;
  };
  userName: string;
  archetypeName: string;
  headerCard: {
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
  } | null;
  cardPairs: Array<{
    id: number;
    topCards: Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
    }>;
    bottomCards: Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
    }>;
    effectiveness?: string;
    comment?: string;
  }>;
}

export const instanceApi = {
  // Get all user instances for a specific archetype
  getInstancesByArchetypeId: async (archetypeId: number): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/archetypes/${archetypeId}/instances`);
    return response.data;
  },

  // Get all archetype instances created by a specific user
  getInstancesByUserId: async (userId: string): Promise<ArchetypeInstanceWithDetails[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/instances`);
    return response.data;
  },

  // Get a specific user's instance for an archetype including card pairs and header
  getUserInstance: async (archetypeId: number, userId: string): Promise<UserInstanceWithCardPairs> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/users/${userId}/instance`
    );
    return response.data;
  },

  // Create a new instance or update an existing instance with a header card
  createOrUpdateInstance: async (archetypeId: number, headerCardId: number | null): Promise<{ instance: ArchetypeInstanceWithDetails }> => {
    const response = await axios.post<{ instance: ArchetypeInstanceWithDetails }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances`,
      { headerCardId },
      { withCredentials: true }
    );
    return response.data;
  },

  // Delete a user's instance for a specific archetype
  deleteUserInstance: async (archetypeId: number, userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete<{ success: boolean; message: string }>(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/users/${userId}/instance`,
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
};
