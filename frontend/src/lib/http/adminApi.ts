import { axiosClient } from "./axiosClient";
import type {
  Profile,
  Publication,
  Report,
  SearchUserResult,
} from "@/features/admin-panel/types/adminPanelTypes";

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface SearchUsersResponse {
  users: SearchUserResult[];
  total: number;
}

interface ChangeCredentialsRequest {
  email?: string;
  username?: string;
  password?: string;
}

interface DeleteInstanceResponse {
  success: boolean;
  deletedCount?: number;
  message?: string;
}

export const adminHttpApi = {
  async searchUsers(
    query: string,
    limit?: number,
  ): Promise<SearchUsersResponse> {
    const { data } = await axiosClient.get<ApiResponse<SearchUsersResponse>>(
      `/api/admin/users/search`,
      {
        params: {
          q: query,
          limit: limit || 10,
        },
      },
    );
    return data.data;
  },

  async getUser(userId: string): Promise<Profile> {
    const { data } = await axiosClient.get<ApiResponse<{ user: Profile }>>(
      `/api/admin/users/${userId}`,
    );
    return data.data.user;
  },

  async deleteUser(userId: string): Promise<void> {
    await axiosClient.delete<ApiResponse<void>>(`/api/admin/users/${userId}`);
  },

  async getUserInstances(userId: string): Promise<Publication[]> {
    const { data } = await axiosClient.get<ApiResponse<Publication[]>>(
      `/api/admin/users/${userId}/instances`,
    );
    return data.data;
  },

  async deleteUserInstance(
    userId: string,
    instanceId: string,
  ): Promise<DeleteInstanceResponse> {
    const { data } = await axiosClient.delete<
      ApiResponse<DeleteInstanceResponse>
    >(`/api/admin/users/${userId}/instances/${instanceId}`);
    return data.data;
  },

  async changeUserCredentials(
    userId: string,
    credentials: ChangeCredentialsRequest,
  ): Promise<void> {
    await axiosClient.put<ApiResponse<void>>(
      `/api/admin/users/${userId}/credentials`,
      credentials,
    );
  },

  async banUser(userId: string): Promise<void> {
    await axiosClient.put<ApiResponse<void>>(
      `/api/admin/users/${userId}/ban`,
      {},
    );
  },

  async unbanUser(userId: string): Promise<void> {
    await axiosClient.put<ApiResponse<void>>(
      `/api/admin/users/${userId}/unban`,
      {},
    );
  },

  async getReports(): Promise<Report[]> {
    const { data } =
      await axiosClient.get<ApiResponse<Report[]>>("/api/admin/reports");
    return data.data;
  },

  async deleteReport(reportId: string): Promise<void> {
    await axiosClient.delete<ApiResponse<void>>(
      `/api/admin/reports/${reportId}`,
    );
  },
};

export default adminHttpApi;
