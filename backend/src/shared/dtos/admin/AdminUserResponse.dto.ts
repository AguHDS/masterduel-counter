export interface AdminUserResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      created_at: string;
      is_banned: boolean;
      ban_reason?: string | null;
      ban_expires?: string | null;
    };
  };
  error?: string;
}
