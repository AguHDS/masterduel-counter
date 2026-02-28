import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../api/changePasswordApi";
import type { ChangePasswordRequest } from "../types";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
};
