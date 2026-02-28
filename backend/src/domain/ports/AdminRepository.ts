import type { UserSearchResult } from "@/shared/dtos/userDto";
import type { ReportWithDetails } from "@/domain/Report";

export interface AdminInstanceResult {
  id: number;
  title: string;
  archetypeId: number;
  archetypeName: string;
  likes: number;
  created_at: string;
  updated_at: string;
  headerCardId?: number | null;
  headerCardName?: string | null;
  headerCardImageUrl?: string | null;
  generalTip?: string | null;
}

export interface AdminRepository {
  /** Search users by name or email */
  searchUsersAdminPanel(query: string, limit?: number): Promise<UserSearchResult[]>;
  /** Get user by ID with admin details */
  getUserByIdAdminPanel(userId: string): Promise<UserSearchResult | null>;
  /** Delete user by ID */
  deleteUser(userId: string): Promise<void>;
  /** Get user instances for admin panel */
  getUserInstancesAdminPanel(userId: string): Promise<AdminInstanceResult[]>;
  /** Delete user instance by ID */
  deleteUserInstance(userId: string, instanceId: number): Promise<void>;
  /** Change user credentials */
  changeUserCredentials(userId: string, credentials: { username?: string; email?: string; password?: string }): Promise<void>;
  /** Change user role */
  changeUserRole(userId: string, role: string): Promise<void>;
  /** Ban user */
  banUser(userId: string, reason: string, expiresAt?: Date | null): Promise<void>;
  /** Unban user */
  unbanUser(userId: string): Promise<void>;
  /** Get all reports */
  getReports(): Promise<ReportWithDetails[]>;
  /** Delete report by ID */
  deleteReport(reportId: number): Promise<void>;
  /** Get total number of registered users */
  getTotalUsers(): Promise<number>;
}
