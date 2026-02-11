import type { UserSearchResult } from "@/shared/dtos/userDto";

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
}
