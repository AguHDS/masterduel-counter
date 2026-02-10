import { AdminRepository } from "@/domain/ports/AdminRepository";
import { AdminService as AdminServicePort } from "@/application/ports/AdminService";

export class AdminServiceImpl implements AdminServicePort {
  constructor(private readonly adminRepository: AdminRepository) {}

  async searchUsersAdminPanel(
    query: string,
    limit: number = 10,
  ): Promise<{
    users: Array<{
      id: string;
      username: string;
      email: string;
      role: string;
      created_at: string;
      is_banned: boolean;
      ban_reason?: string | null;
      ban_expires?: string | null;
    }>;
    total: number;
  }> {
    const users = await this.adminRepository.searchUsersAdminPanel(
      query,
      limit,
    );

    return {
      users,
      total: users.length,
    };
  }

  async getUserByIdAdminPanel(userId: string): Promise<{
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      created_at: string;
      is_banned: boolean;
      ban_reason?: string | null;
      ban_expires?: string | null;
    } | null;
  }> {
    const user = await this.adminRepository.getUserByIdAdminPanel(userId);

    if (!user) {
      return { user: null };
    }

    return { user };
  }

  async deleteUser(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const user = await this.adminRepository.getUserByIdAdminPanel(userId);
      
      if (!user) {
        return {
          success: false,
          message: "User not found"
        };
      }

      await this.adminRepository.deleteUser(userId);
      
      return {
        success: true,
        message: "User deleted successfully"
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        message: "Internal error deleting user"
      };
    }
  }
}
