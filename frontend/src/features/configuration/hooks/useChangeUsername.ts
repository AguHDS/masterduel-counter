import { useMutation } from "@tanstack/react-query";
import { changeUsername } from "../api/changeUsernameApi";
import type { ChangeUsernameRequest } from "../types";

export const useChangeUsername = () => {
  return useMutation({
    mutationFn: (data: ChangeUsernameRequest) => changeUsername(data),
  });
};
