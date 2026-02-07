import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";

export const useAdminAuth = () => {
  return useRequireAuth("admin");
};
