import { AuthService } from "@/application/ports/AuthService";
import { UserRepository } from "@/domain/ports/UserRepository";
import { UserLoginDTO, UserLoginResponse } from "@/domain/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthServiceImpl implements AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
    this.jwtSecret = process.env.JWT_SECRET || "secret-key";
  }

  async login(credentials: UserLoginDTO): Promise<UserLoginResponse> {
    try {
      const user = await this.userRepository.findByUsername(
        credentials.username,
      );

      if (!user) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      // Check if user has admin role
      if (user.role !== "admin") {
        return {
          success: false,
          message: "Unauthorized - Admin access required",
        };
      }

      // Verify password if it exists (for old admin accounts)
      if (user.password_hash) {
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );

        if (!isPasswordValid) {
          return {
            success: false,
            message: "Invalid credentials",
          };
        }
      } else {
        // No password_hash means this is a BetterAuth user, redirect to new auth
        return {
          success: false,
          message: "Please use the new authentication system",
        };
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        this.jwtSecret,
        { expiresIn: "7d" },
      );

      return {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An error occurred during login",
      };
    }
  }

  async verifyToken(
    token: string,
  ): Promise<{ valid: boolean; userId?: string; username?: string; role?: string }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as {
        userId: string;
        username: string;
        role: string;
      };
      return {
        valid: true,
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      };
    } catch {
      return {
        valid: false,
      };
    }
  }
}
