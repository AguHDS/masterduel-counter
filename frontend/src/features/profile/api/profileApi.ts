import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface Profile {
  id: number;
  userId: string;
  userName: string;
  bio: string | null;
  profilePictureUrl: string | null;
  cloudinaryPublicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  profile: Profile;
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
};
