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
  reportedInstanceArchetypeName?: string | null;
  reportedInstanceGuideType?: "COUNTER" | "DECK" | null;
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

export interface PaginatedUsersResponse {
  users: SearchUserResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type AdminTab = "accounts" | "reports" | "tracking" | "latest-updates" | "tier-list" | "archetypes" | "server";

export type ServerTaskType =
  | "download-cards"
  | "populate-archetypes"
  | "generate-thumbnails"
  | "update-card-details"
  | "migrate-card-images";

export type ServerTaskStatus = "running" | "done" | "failed" | "cancelled";

export interface ServerTask {
  id: string;
  type: ServerTaskType;
  status: ServerTaskStatus;
  startedAt: string;
  finishedAt: string | null;
  pid: number | null;
  logFile: string;
  exitCode: number | null;
}

export interface ServerMaintenanceState {
  enabled: boolean;
  message: string | null;
  auto: boolean;
}

export interface ServerState {
  maintenance: ServerMaintenanceState;
  task: ServerTask | null;
  lastTask: ServerTask | null;
  logTail: string[];
}

export interface ServerStateResponse {
  success: boolean;
  maintenance: ServerMaintenanceState;
  task: ServerTask | null;
  lastTask: ServerTask | null;
  logTail: string[];
}

export interface SiteStatus {
  success: boolean;
  maintenance: boolean;
  message: string | null;
}