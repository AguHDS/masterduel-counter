import { axiosClient } from "@/lib/http";

export interface AdminLoginCredentials {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  admin?: {
    id: number;
    username: string;
  };
}

export const loginAdmin = async (
  credentials: AdminLoginCredentials
): Promise<AdminLoginResponse> => {
  const response = await axiosClient.post<AdminLoginResponse>(
    "/api/signAsAdmin",
    credentials
  );
  return response.data;
};
