import { createContext, type ReactNode } from "react";
import { useSession } from "@/lib/auth-client";
import { useLogout } from "../hooks/useAuthQueries";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isPending } = useSession();
  const logoutMutation = useLogout();

  const isAuthenticated = !!session?.user;
  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: (session.user as any).role,
  } : null;

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
    });
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading: isPending,
    user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

