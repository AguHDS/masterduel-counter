import { authClient } from "@/lib/auth-client";
import type { ChangePasswordRequest, ChangePasswordResponse } from "../types";

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  // Use BetterAuth's native changePassword method
  const result = await authClient.changePassword({
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    revokeOtherSessions: true,
  });

  // BetterAuth returns { data, error }
  // If there's an error, throw it
  if (result.error) {
    throw new Error(result.error.message || "Failed to change password");
  }

  // If no data success indicator, something went wrong
  if (!result.data) {
    throw new Error("Password change failed");
  }

  return {
    success: true,
    message: "Password changed successfully",
  };
};
