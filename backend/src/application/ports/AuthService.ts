import { UserLoginDTO, UserLoginResponse } from "@/domain/User";

export interface AuthService {
  login(credentials: UserLoginDTO): Promise<UserLoginResponse>;
  verifyToken(
    token: string,
  ): Promise<{ valid: boolean; userId?: string; username?: string; role?: string }>;
}
