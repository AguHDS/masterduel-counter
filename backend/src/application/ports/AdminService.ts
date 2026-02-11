import type { UserSearchResult } from "@/shared/dtos/userDto";
import type { AdminInstanceResult } from "@/domain/ports/AdminRepository";

export interface AdminService {
  /** Search users by name or email */
  searchUsersAdminPanel(
    query: string,
    limit?: number,
  ): Promise<{
    users: UserSearchResult[];
    total: number;
  }>;

  /** Get user by ID with admin details */
  getUserByIdAdminPanel(userId: string): Promise<{
    user: UserSearchResult | null;
  }>;

  /** Delete user by ID */
  deleteUser(userId: string): Promise<{
    success: boolean;
    message: string;
  }>;

  /** Get user instances for admin panel */
  getUserInstancesAdminPanel(userId: string): Promise<{
    instances: AdminInstanceResult[];
    total: number;
  }>;
}
