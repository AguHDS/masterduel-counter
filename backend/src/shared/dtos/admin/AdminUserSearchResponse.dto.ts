export interface AdminUserSearchResponse {
  success: boolean;
  data: {
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
  };
  error?: string;
}
