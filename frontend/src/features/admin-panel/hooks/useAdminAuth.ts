import { useRequireAdminAuth } from "@/features/auth/hooks/useRequireAdminAuth";

export const useAdminAuth = () => {
  return useRequireAdminAuth("admin");
};
