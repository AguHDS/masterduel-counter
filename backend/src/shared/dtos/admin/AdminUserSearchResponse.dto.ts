import type { UserSearchResult } from "../userDto";

export interface AdminUserSearchResponse {
  success: boolean;
  data: {
    users: UserSearchResult[];
    total: number;
  };
  error?: string;
}
