import type { InstanceGuideResultAdminPanel } from "@/domain/ports/AdminRepository.js";

export interface AdminUserInstancesResponse {
  success: boolean;
  data: {
    instances: InstanceGuideResultAdminPanel[];
    total: number;
  };
  error?: string;
}
