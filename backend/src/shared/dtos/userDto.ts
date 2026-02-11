export interface UserSession {
  user: string;
  email: string;
  password: string;
}

export interface UserAndPassword {
  user: string;
  password: string;
}

export interface BaseUserData {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface UserSearchResult {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  is_banned: boolean;
  ban_reason?: string | null;
  ban_expires?: string | null;
}

export type UserId = string;
