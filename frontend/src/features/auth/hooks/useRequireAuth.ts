import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export const useRequireAuth = (requiredRole?: string) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/signin", { replace: true });
        return;
      }

      // If a required role is specified but the user doesn't have it
      if (requiredRole && user?.role !== requiredRole) {
        navigate("/", { replace: true });
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, navigate]);

  return { isAuthenticated, isLoading, user };
};
