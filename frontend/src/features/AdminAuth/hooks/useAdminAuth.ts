import { useState } from "react";
import { loginAdmin, type AdminLoginCredentials } from "../api/authApi";
import { useAuth } from "./useAuth";

export const useAdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuthenticated } = useAuth();

  const login = async (credentials: AdminLoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginAdmin(credentials);

      if (response.success) {
        // Token is stored in httpOnly cookie by the server
        // Optionally store only non-sensitive user info
        if (response.admin?.username) {
          localStorage.setItem("adminUsername", response.admin.username);
          // Update global auth context
          setAuthenticated({
            id: response.admin.id,
            username: response.admin.username,
          });
        }
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch {
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
};
