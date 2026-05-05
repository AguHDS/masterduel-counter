import { axiosClient } from "@/lib/http/axiosClient";
import type {
  Profile,
  Report,
  SearchUserResult,
  UserInstance,
  PaginatedUsersResponse,
} from "../types/adminPanelTypes";

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface SearchUsersResponse {
  users: SearchUserResult[];
  total: number;
}

interface UserInstancesResponse {
  instances: UserInstance[];
  total: number;
}

interface ReportsResponse {
  reports: Report[];
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

interface TotalUsersResponse {
  total: number;
}

export const searchUsers = async (
  query: string,
  limit?: number,
): Promise<SearchUsersResponse> => {
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
};

export const getUser = async (userId: string): Promise<Profile> => {
  const { data } = await axiosClient.get<ApiResponse<{ user: Profile }>>(
    `/api/admin/users/${userId}`,
  );
  return data.data.user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<void>>(`/api/admin/users/${userId}`);
};

export const getUserInstances = async (
  userId: string,
): Promise<UserInstance[]> => {
  const { data } = await axiosClient.get<ApiResponse<UserInstancesResponse>>(
    `/api/admin/users/${userId}/instances`,
  );
  return data.data.instances;
};

export const deleteUserGuide = async (
  userId: string,
  instanceId: string,
): Promise<DeleteInstanceResponse> => {
  const { data } = await axiosClient.delete<
    ApiResponse<DeleteInstanceResponse>
  >(`/api/admin/users/${userId}/instances/${instanceId}`);
  return data.data;
};

export const changeUserCredentials = async (
  userId: string,
  credentials: ChangeCredentialsRequest,
): Promise<void> => {
  await axiosClient.put<ApiResponse<void>>(
    `/api/admin/users/${userId}/credentials`,
    credentials,
  );
};

export const changeUserRole = async (
  userId: string,
  role: string,
): Promise<void> => {
  await axiosClient.put<ApiResponse<void>>(`/api/admin/users/${userId}/role`, {
    role,
  });
};

export const banUser = async (
  userId: string,
  reason: string,
  expiresAt?: string | null,
): Promise<void> => {
  await axiosClient.put<ApiResponse<void>>(`/api/admin/users/${userId}/ban`, {
    reason,
    expiresAt,
  });
};

export const unbanUser = async (userId: string): Promise<void> => {
  await axiosClient.put<ApiResponse<void>>(
    `/api/admin/users/${userId}/unban`,
    {},
  );
};

export const getReports = async (): Promise<Report[]> => {
  const { data } =
    await axiosClient.get<ApiResponse<ReportsResponse>>("/api/admin/reports");
  return data.data.reports;
};

export const deleteReport = async (reportId: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<void>>(`/api/admin/reports/${reportId}`);
};

export const deleteGuideRequest = async (requestId: number): Promise<void> => {
  await axiosClient.delete<ApiResponse<void>>(
    `/api/admin/guide-requests/${requestId}`,
  );
};

export const getTotalUsers = async (): Promise<number> => {
  const { data } = await axiosClient.get<ApiResponse<TotalUsersResponse>>(
    `/api/admin/tracking/total-users`,
  );
  return data.data.total;
};

export const getAllUsers = async (
  page: number,
  limit: number,
  sortBy: string = "created_at",
  sortOrder: string = "desc",
  search?: string,
): Promise<PaginatedUsersResponse> => {
  const { data } = await axiosClient.get<ApiResponse<PaginatedUsersResponse>>(
    `/api/admin/tracking/users`,
    {
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
      },
    },
  );
  return data.data;
};

export const adminApi = {
  searchUsers,
  getUser,
  deleteUser,
  getUserInstances,
  deleteUserGuide,
  changeUserCredentials,
  changeUserRole,
  banUser,
  unbanUser,
  getReports,
  deleteReport,
  deleteGuideRequest,
  getTotalUsers,
  getAllUsers,
};
