import { axiosClient } from "@/lib/http";

export interface VerifyAuthResponse {
  success: boolean;
  authenticated: boolean;
  admin?: {
    id: number;
    username: string;
  };
}

export const verifyAuth = async (): Promise<VerifyAuthResponse> => {
  const response = await axiosClient.get<VerifyAuthResponse>("/api/verifyAuth");
  return response.data;
};
