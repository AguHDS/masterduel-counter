import { authClient } from "@/lib/auth-client";
import type { ChangePasswordRequest, ChangePasswordResponse } from "../types";

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  try {
    // Use BetterAuth's native changePassword method
    await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: true,
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error: unknown) {
    let errorMessage = "Failed to change password";

    // Handle different error formats from BetterAuth
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      errorMessage = String((error as { message: string }).message);
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    // Throw with the extracted message so the mutation can catch it
    throw new Error(errorMessage);
  }
};
