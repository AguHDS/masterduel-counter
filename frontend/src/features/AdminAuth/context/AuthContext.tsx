import { createContext, type ReactNode } from "react";
import { useVerifyAuth, useLogoutAdmin } from "../hooks/useAuthQueries";

export interface Admin {
  id: number;
  username: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: Admin | null;
  logout: () => void;
  refetch: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: authData, isLoading, refetch } = useVerifyAuth();
  const logoutMutation = useLogoutAdmin();

  const isAuthenticated = authData?.authenticated ?? false;
  const admin = authData?.admin ?? null;

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          localStorage.removeItem("adminUsername");
          window.location.href = "/";
        }
      },
    });
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    admin,
    logout,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

