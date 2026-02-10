import type { RefreshTokenId } from "./jwtUserData.ts";
import type {
  UserSession,
  UserAndPassword,
  BaseUserData,
  UserId,
} from "./userDto.ts";

declare module "express" {
  interface Request {
    requesterData?: {
      id: string;
      role: string;
    };

    userId?: UserId;
    userAndPassword?: UserAndPassword;
    userSession?: UserSession;
    refreshTokenId?: RefreshTokenId;
    baseUserData?: BaseUserData;

    // BetterAuth user from session
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };

    userToDelete?: {
      id: string;
      username: string;
      email: string;
      role: string;
      created_at: string;
      is_banned: boolean;
      ban_reason?: string | null;
      ban_expires?: string | null;
    };
  }
}
