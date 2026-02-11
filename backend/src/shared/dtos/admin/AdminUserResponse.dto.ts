import type { UserSearchResult } from "../userDto";

export interface AdminUserResponse {
  success: boolean;
  data: {
    user: UserSearchResult;
  };
  error?: string;
}
