import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";
import type { GuideListItem } from "@/lib/http/guideInstancesApi";

const API_URL = getBackendUrl();

export interface Profile {
  id: number;
  userId: string;
  userName: string;
  bio: string | null;
  profilePictureUrl: string | null;
  cloudinaryPublicId: string | null;
  favoriteCardId: number | null;
  favoriteDecks: string | null;
  role: string;
  totalLikes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  profile: Profile;
  totalViews?: number;
  rank?: number | null;
  fulfilledRequestsCount?: number;
  message?: string;
}

export const profileApi = {
  async getProfile(userId: string): Promise<ProfileResponse> {
    const response = await axios.get(`${API_URL}/api/profile/${userId}`);
    return response.data;
  },

  async updateBio(userId: string, bio: string): Promise<ProfileResponse> {
    const response = await axios.put(`${API_URL}/api/profile/${userId}/bio`, {
      bio,
    });
    return response.data;
  },

  async uploadProfilePicture(
    userId: string,
    file: File
  ): Promise<ProfileResponse> {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await axios.post(
      `${API_URL}/api/profile/${userId}/upload-photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async deleteProfilePicture(userId: string): Promise<ProfileResponse> {
    const response = await axios.delete(
      `${API_URL}/api/profile/${userId}/photo`
    );
    return response.data;
  },

  async updateFavorites(
    userId: string,
    data: {
      favoriteCardId?: number | null;
      favoriteDecks?: string | null;
    }
  ): Promise<ProfileResponse> {
    const response = await axios.put(
      `${API_URL}/api/profile/${userId}/favorites`,
      data
    );
    return response.data;
  },

  async getFavoritedGuides(userId: string): Promise<{
    success: boolean;
    guides: GuideListItem[];
  }> {
    const response = await axios.get(`${API_URL}/api/profile/${userId}/favoritedGuides`);
    return response.data;
  },

  /** Get all archetype guides created by a specific user */
  getGuidesByUserId: async (
    userId: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<GuideListItem[]> => {
    const response = await axios.get(
      `${API_URL}/api/users/${userId}/instances`,
      { params: { sortBy } },
    );
    return response.data;
  },

  /** Search users by username */
  searchUsers: async (
    query: string,
    limit: number = 10
  ): Promise<{
    success: boolean;
    users: Array<{
      userId: string;
      username: string;
      profilePictureUrl: string | null;
    }>;
    total: number;
  }> => {
    const response = await axios.get(`${API_URL}/api/profile/search`, {
      params: { q: query, limit },
    });
    return response.data;
  },

  /** Search guide instances by user ID and title */
  searchGuidesByUserId: async (
    userId: string,
    title: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<GuideListItem[]> => {
    const response = await axios.get(
      `${API_URL}/api/users/${userId}/instances/search`,
      { params: { title, sortBy } },
    );
    return response.data;
  },
};