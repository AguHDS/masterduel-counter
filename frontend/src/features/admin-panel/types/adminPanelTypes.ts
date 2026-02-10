export interface Profile {
  id: string;
  email: string;
  username: string;
  role: string;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
  ban_reason?: string | null;
  ban_expires?: string | null;
}

export interface SearchUserResult {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  is_banned: boolean;
  ban_reason?: string | null;
  ban_expires?: string | null;
}

export interface Publication {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Report {
  id: string;
  publication_id: string;
  reporter_user_id: string;
  publication_name: string;
  message: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  is_banned?: boolean;
}

export type AdminTab = "accounts" | "reports";
