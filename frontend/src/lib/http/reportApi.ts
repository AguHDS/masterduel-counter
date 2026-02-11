import { axiosClient } from "./axiosClient";

interface CreateReportRequest {
  reportedUserId?: string;
  reportedInstanceId?: number;
  reason: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

export const reportApi = {
  async createReport(data: CreateReportRequest): Promise<void> {
    await axiosClient.post<ApiResponse<{ reportId: number }>>(
      "/api/reports",
      data,
    );
  },
};
