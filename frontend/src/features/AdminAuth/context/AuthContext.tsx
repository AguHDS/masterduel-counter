import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { verifyAuth } from "../api/verifyAuthApi";
import { logoutAdmin } from "../api/logoutApi";

export interface Admin {
  id: number;
  username: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: Admin | null;
  logout: () => Promise<{ success: boolean }>;
  refetch: () => Promise<void>;
  setAuthenticated: (admin: Admin) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<Admin | null>(null);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const result = await verifyAuth();
      setIsAuthenticated(result.authenticated);
      if (result.authenticated && result.admin) {
        setAdmin(result.admin);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      console.error("Error verifying authentication:", error);
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      const result = await logoutAdmin();
      if (result.success) {
        setIsAuthenticated(false);
        setAdmin(null);
        localStorage.removeItem("adminUsername");
        window.location.href = "/";
      }
      return result;
    } catch (error) {
      console.error("Error during logout:", error);
      return { success: false };
    }
  };

  const setAuthenticated = (adminData: Admin) => {
    setIsAuthenticated(true);
    setAdmin(adminData);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    admin,
    logout,
    refetch: checkAuth,
    setAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
