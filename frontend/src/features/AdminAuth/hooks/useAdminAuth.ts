import { useLoginAdmin } from "./useAuthQueries";
import { useAuth } from "./useAuth";
import type { AdminLoginCredentials } from "../api/authApi";

export const useAdminAuth = () => {
  const loginMutation = useLoginAdmin();
  const { refetch } = useAuth();

  const login = async (credentials: AdminLoginCredentials) => {
    try {
      const response = await loginMutation.mutateAsync(credentials);

      if (response.success && response.admin?.username) {
        localStorage.setItem("adminUsername", response.admin.username);
        // Refetch auth state to update context
        refetch();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      return { success: false, error: errorMessage };
    }
  };

  return {
    login,
    isLoading: loginMutation.isPending,
    error: loginMutation.error?.message ?? null,
  };
};

