import { AuthService } from "@/application/ports/AuthService";
import { AdminRepository } from "@/domain/ports/AdminRepository";
import { AdminLoginDTO, AdminLoginResponse } from "@/domain/Admin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthServiceImpl implements AuthService {
  private adminRepository: AdminRepository;
  private jwtSecret: string;

  constructor(adminRepository: AdminRepository) {
    this.adminRepository = adminRepository;
    this.jwtSecret = process.env.JWT_SECRET || "secret-key";
  }

  async login(credentials: AdminLoginDTO): Promise<AdminLoginResponse> {
    try {
      const admin = await this.adminRepository.findByUsername(credentials.username);

      if (!admin) {
        return {
          success: false,
          message: "Invalid credentials"
        };
      }

      const isPasswordValid = await bcrypt.compare(credentials.password, admin.password_hash);

      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid credentials"
        };
      }

      const token = jwt.sign(
        { adminId: admin.id, username: admin.username },
        this.jwtSecret,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: "Login successful",
        token,
        admin: {
          id: admin.id,
          username: admin.username
        }
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An error occurred during login"
      };
    }
  }

  async verifyToken(token: string): Promise<{ valid: boolean; adminId?: number; username?: string }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { adminId: number; username: string };
      return {
        valid: true,
        adminId: decoded.adminId,
        username: decoded.username
      };
    } catch {
      return {
        valid: false
      };
    }
  }
}
