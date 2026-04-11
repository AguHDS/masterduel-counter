import { axiosClient } from "@/lib/http";
import type { ChangeUsernameRequest, ChangeUsernameResponse } from "../types";

export const changeUsername = async (
  data: ChangeUsernameRequest,
): Promise<ChangeUsernameResponse> => {
  try {
    const response = await axiosClient.post<ChangeUsernameResponse>(
      "/api/auth/change-username",
      {
        username: data.username,
      },
    );

    return response.data;
  } catch (error) {
    const typedError = error as {
      userMessage?: string;
      response?: { data?: { message?: string } };
      message?: string;
    };

    const message =
      typedError.response?.data?.message ||
      typedError.userMessage ||
      typedError.message ||
      "Failed to change username";

    throw new Error(message);
  }
};
