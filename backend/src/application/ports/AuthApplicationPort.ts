import { UserLoginDTO, UserLoginResponse } from "@/domain/User.js";

export interface AuthApplicationPort {
  /** Authenticate a user with their credentials */
  login(credentials: UserLoginDTO): Promise<UserLoginResponse>;
  /** Verify the validity of token */
  verifyToken(
    token: string,
  ): Promise<{ valid: boolean; userId?: string; username?: string; role?: string }>;
}
