import type { UserSearchResult } from "@/shared/dtos/userDto";
import type { AdminInstanceResult } from "@/domain/ports/AdminRepository";
import type { ReportWithDetails } from "@/domain/Report";

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

  /** Delete user instance by ID */
  deleteUserInstance(userId: string, instanceId: number): Promise<{
    success: boolean;
    message: string;
  }>;

  /** Change user credentials */
  changeUserCredentials(
    userId: string,
    credentials: { username?: string; email?: string; password?: string },
  ): Promise<{
    success: boolean;
    message: string;
  }>;

  /** Change user role */
  changeUserRole(
    userId: string,
    role: string,
  ): Promise<{
    success: boolean;
    message: string;
  }>;

  /** Ban user */
  banUser(
    userId: string,
    reason: string,
    expiresAt?: Date | null,
  ): Promise<{
    success: boolean;
    message: string;
  }>;

  /** Unban user */
  unbanUser(userId: string): Promise<{
    success: boolean;
    message: string;
  }>;

  /** Get all reports */
  getReports(): Promise<{
    reports: ReportWithDetails[];
    total: number;
  }>;

  /** Delete report by ID */
  deleteReport(reportId: number): Promise<{
    success: boolean;
    message: string;
  }>;

  /** Get total number of registered users */
  getTotalUsers(): Promise<{
    total: number;
  }>;
}
