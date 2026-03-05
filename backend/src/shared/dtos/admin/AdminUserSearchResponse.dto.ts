import type { UserSearchResult } from "../userDto.js";

export interface AdminUserSearchResponse {
  success: boolean;
  data: {
    users: UserSearchResult[];
    total: number;
  };
  error?: string;
}
