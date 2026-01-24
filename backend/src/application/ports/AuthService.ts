import { AdminLoginDTO, AdminLoginResponse } from "@/domain/Admin";

export interface AuthService {
  login(credentials: AdminLoginDTO): Promise<AdminLoginResponse>;
  verifyToken(token: string): Promise<{ valid: boolean; adminId?: number; username?: string }>;
}
