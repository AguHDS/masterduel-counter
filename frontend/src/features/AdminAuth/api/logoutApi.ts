import { axiosClient } from "@/lib/http";

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const logoutAdmin = async (): Promise<LogoutResponse> => {
  const response = await axiosClient.post<LogoutResponse>("/api/logout");
  return response.data;
};
