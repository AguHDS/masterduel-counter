export interface AdminService {
  /** Search users by name or email */
  searchUsersAdminPanel(
    query: string,
    limit?: number,
  ): Promise<{
    users: Array<{
      id: string;
      username: string;
      email: string;
      role: string;
      created_at: string;
      is_banned: boolean;
      ban_reason?: string | null;
      ban_expires?: string | null;
    }>;
    total: number;
  }>;

  /** Get user by ID with admin details */
  getUserByIdAdminPanel(userId: string): Promise<{
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      created_at: string;
      is_banned: boolean;
      ban_reason?: string | null;
      ban_expires?: string | null;
    } | null;
  }>;

  /** Delete user by ID */
  deleteUser(userId: string): Promise<{
    success: boolean;
    message: string;
  }>;
}
