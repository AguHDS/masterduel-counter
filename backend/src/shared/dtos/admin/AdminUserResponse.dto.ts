import type { UserSearchResult } from "../userDto.js";

export interface AdminUserResponse {
  success: boolean;
  data: {
    user: UserSearchResult;
  };
  error?: string;
}
