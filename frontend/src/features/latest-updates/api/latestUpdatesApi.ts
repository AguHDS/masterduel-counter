import { axiosClient } from "@/lib/http/axiosClient";
import type {
  LatestUpdate,
  CreateLatestUpdateDTO,
  PaginatedLatestUpdates,
} from "../types/latestUpdatesTypes";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const latestUpdatesApi = {
  async getAllLastestUpdate(): Promise<LatestUpdate[]> {
    const { data } = await axiosClient.get<ApiResponse<LatestUpdate[]>>(
      "/api/latest-updates",
    );
    return data.data;
  },

  async getAllPaginatedLastestUpdates(
    page: number,
    limit: number = 20,
  ): Promise<PaginatedLatestUpdates> {
    const { data } = await axiosClient.get<
      ApiResponse<PaginatedLatestUpdates>
    >("/api/latest-updates/all", {
      params: { page, limit },
    });
    return data.data;
  },

  async getLastestUpdatesById(id: number): Promise<LatestUpdate> {
    const { data } = await axiosClient.get<ApiResponse<LatestUpdate>>(
      `/api/latest-updates/${id}`,
    );
    return data.data;
  },

  async CreateLatestUpdate(dto: CreateLatestUpdateDTO): Promise<LatestUpdate> {
    const { data } = await axiosClient.post<ApiResponse<LatestUpdate>>(
      "/api/latest-updates",
      dto,
    );
    return data.data;
  },

  async updateLastestUpdate(
    id: number,
    dto: Partial<CreateLatestUpdateDTO>,
  ): Promise<LatestUpdate> {
    const { data } = await axiosClient.put<ApiResponse<LatestUpdate>>(
      `/api/latest-updates/${id}`,
      dto,
    );
    return data.data;
  },

  async deleteLastestUpdate(id: number): Promise<void> {
    await axiosClient.delete(`/api/latest-updates/${id}`);
  },
};
