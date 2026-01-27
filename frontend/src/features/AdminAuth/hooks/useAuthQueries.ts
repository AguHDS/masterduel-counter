import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, QUERY_STALE_TIME } from "@/lib/query";
import {
  loginAdmin,
  type AdminLoginCredentials,
  type AdminLoginResponse,
} from "../api/authApi";
import { verifyAuth, type VerifyAuthResponse } from "../api/verifyAuthApi";
import { logoutAdmin, type LogoutResponse } from "../api/logoutApi";

/**
 * Hook to verify authentication status
 * Uses SHORT stale time for frequent re-validation
 */
export const useVerifyAuth = () => {
  return useQuery<VerifyAuthResponse>({
    queryKey: queryKeys.auth.verify(),
    queryFn: verifyAuth,
    staleTime: QUERY_STALE_TIME.SHORT,
    retry: false, // Don't retry auth checks
  });
};

/**
 * Hook to handle admin login
 */
export const useLoginAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminLoginResponse, Error, AdminLoginCredentials>({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate auth queries to refetch user state
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      }
    },
  });
};

/**
 * Hook to handle admin logout
 */
export const useLogoutAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation<LogoutResponse, Error>({
    mutationFn: logoutAdmin,
    onSuccess: (data) => {
      if (data.success) {
        // Clear all auth-related cache
        queryClient.removeQueries({ queryKey: queryKeys.auth.all });
        // Invalidate registered archetypes (they show creator names)
        queryClient.invalidateQueries({ queryKey: queryKeys.archetypes.registered() });
      }
    },
  });
};
