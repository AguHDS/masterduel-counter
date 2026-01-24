import { useState, useEffect } from "react";
import { verifyAuth } from "../api/verifyAuthApi";
import { logoutAdmin } from "../api/logoutApi";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<{ id: number; username: string } | null>(
    null,
  );

  const checkAuth = async () => {
    setIsLoading(true);
    const result = await verifyAuth();
    setIsAuthenticated(result.authenticated);
    if (result.authenticated && result.admin) {
      setAdmin(result.admin);
    } else {
      setAdmin(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    const result = await logoutAdmin();
    if (result.success) {
      setIsAuthenticated(false);
      setAdmin(null);
      localStorage.removeItem("adminUsername");
      window.location.href = "/";
    }
    return result;
  };

  return {
    isAuthenticated,
    isLoading,
    admin,
    logout,
    refetch: checkAuth,
  };
};
