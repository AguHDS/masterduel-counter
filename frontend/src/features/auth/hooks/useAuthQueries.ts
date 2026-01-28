import { useMutation } from "@tanstack/react-query";
import {
  loginUser,
  registerUser,
} from "../api/authApi";
import { logoutUser } from "../api/logoutApi";

/**
 * Hook to handle user login
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
  });
};

/**
 * Hook to handle user registration
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};

/**
 * Hook to handle user logout
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: logoutUser,
  });
};
