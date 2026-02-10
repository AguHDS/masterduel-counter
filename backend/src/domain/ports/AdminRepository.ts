export interface AdminUserSearchResult {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  is_banned: boolean;
  ban_reason?: string | null;
  ban_expires?: string | null;
}

export interface AdminRepository {
  /** Search users by name or email */
  searchUsersAdminPanel(query: string, limit?: number): Promise<AdminUserSearchResult[]>;
  /** Get user by ID with admin details */
  getUserByIdAdminPanel(userId: string): Promise<AdminUserSearchResult | null>;
  /** Delete user by ID */
  deleteUser(userId: string): Promise<void>;
}
