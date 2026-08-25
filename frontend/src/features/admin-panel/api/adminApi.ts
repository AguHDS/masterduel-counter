import { axiosClient } from "@/lib/http/axiosClient";
import type {
  Profile,
  Report,
  SearchUserResult,
  UserInstance,
  PaginatedUsersResponse,
  ServerStateResponse,
  ServerTaskType,
  ServerTask,
  SiteStatus,
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

/** Server management, get operational state (maintenance + running task + log tail) */
export const getServerState = async (): Promise<ServerStateResponse> => {
  const { data } = await axiosClient.get<ServerStateResponse>(
    "/api/admin/server/state",
  );
  return data;
};

/** Server management - start a maintenance task */
export const startServerTask = async (
  type: ServerTaskType,
  options?: { delay?: number; limit?: number },
): Promise<{ task: ServerTask }> => {
  const { data } = await axiosClient.post<{ success: boolean; task: ServerTask }>(
    "/api/admin/server/tasks",
    { type, options },
  );
  return { task: data.task };
};

/** Server management - cancel the running task */
export const cancelServerTask = async (id: string): Promise<void> => {
  await axiosClient.post(`/api/admin/server/tasks/${id}/cancel`);
};

/** Server management - manually toggle maintenance mode */
export const setServerMaintenance = async (
  enabled: boolean,
  message?: string | null,
): Promise<void> => {
  await axiosClient.put("/api/admin/server/maintenance", { enabled, message });
};

/** Server management - restart the backend (pm2, production only) */
export const restartServer = async (): Promise<void> => {
  await axiosClient.post("/api/admin/server/restart");
};

/** Public - site status (maintenance flag) for the frontend gate */
export const getSiteStatus = async (): Promise<SiteStatus> => {
  const { data } = await axiosClient.get<SiteStatus>("/api/status");
  return data;
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
  getServerState,
  startServerTask,
  cancelServerTask,
  setServerMaintenance,
  restartServer,
  getSiteStatus,
};
