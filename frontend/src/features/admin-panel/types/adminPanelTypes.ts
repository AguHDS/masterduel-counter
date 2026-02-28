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

export interface UserInstance {
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
  id: number;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reportedUserId?: string | null;
  reportedUserName?: string | null;
  reportedInstanceId?: number | null;
  reportedInstanceTitle?: string | null;
  reportedInstanceAuthorId?: string | null;
  reportedInstanceAuthorName?: string | null;
  reportedInstanceArchetypeId?: number | null;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  is_banned?: boolean;
}

export type AdminTab = "accounts" | "reports" | "tracking";
