import type { AdminInstanceResult } from "@/domain/ports/AdminRepository.js";

export interface AdminUserInstancesResponse {
  success: boolean;
  data: {
    instances: AdminInstanceResult[];
    total: number;
  };
  error?: string;
}
