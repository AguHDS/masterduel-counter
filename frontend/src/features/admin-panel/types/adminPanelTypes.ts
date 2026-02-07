export interface Profile {
  id: string;
  email: string;
  name: string;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
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

export type AdminTab = "accounts" | "reports" | "publications";
