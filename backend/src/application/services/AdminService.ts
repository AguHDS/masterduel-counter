import { AdminRepository } from "@/domain/ports/AdminRepository.js";
import { AdminService as AdminServicePort } from "@/application/ports/AdminService.js";
import type { UserSearchResult } from "@/shared/dtos/userDto.js";
import type { InstanceGuideResultAdminPanel } from "@/domain/ports/AdminRepository.js";
import type { ReportWithDetails } from "@/domain/Report.js";

export class AdminServiceImpl implements AdminServicePort {
  constructor(private readonly adminRepository: AdminRepository) {}

  async searchUsersAdminPanel(
    query: string,
    limit: number = 10,
  ): Promise<{
    users: UserSearchResult[];
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
    user: UserSearchResult | null;
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
          message: "User not found",
        };
      }

      await this.adminRepository.deleteUser(userId);

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting user:", error);

      if (error instanceof Error) {
        if (error.message.includes("P2003")) {
          return {
            success: false,
            message: "Cannot delete user because it has associated data",
          };
        }

        if (error.message.includes("P2025")) {
          return {
            success: false,
            message: "User not found",
          };
        }
      }

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal error deleting user",
      };
    }
  }

  async getUserGuidesAdminPanel(userId: string): Promise<{
    instances: InstanceGuideResultAdminPanel[];
    total: number;
  }> {
    const instances =
      await this.adminRepository.getUserGuidesAdminPanel(userId);

    return {
      instances,
      total: instances.length,
    };
  }

  async deleteUserGuide(
    userId: string,
    guideId: number,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.adminRepository.deleteUserGuide(userId, guideId);
      return {
        success: true,
        message: "Guide deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting guide:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal error deleting guide",
      };
    }
  }

  async changeUserCredentials(
    userId: string,
    credentials: { username?: string; email?: string; password?: string },
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Validate at least one credential is provided
      if (
        !credentials.username &&
        !credentials.email &&
        !credentials.password
      ) {
        return {
          success: false,
          message: "At least one credential must be provided",
        };
      }

      await this.adminRepository.changeUserCredentials(userId, credentials);
      return {
        success: true,
        message: "User credentials updated successfully",
      };
    } catch (error) {
      console.error("Error changing user credentials:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal error changing credentials",
      };
    }
  }

  async banUser(
    userId: string,
    reason: string,
    expiresAt?: Date | null,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.adminRepository.banUser(userId, reason, expiresAt);
      return {
        success: true,
        message: expiresAt
          ? `User banned until ${expiresAt.toISOString()}`
          : "User permanently banned",
      };
    } catch (error) {
      console.error("Error banning user:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal error banning user",
      };
    }
  }

  async unbanUser(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.adminRepository.unbanUser(userId);
      return {
        success: true,
        message: "User unbanned successfully",
      };
    } catch (error) {
      console.error("Error unbanning user:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal error unbanning user",
      };
    }
  }

  async changeUserRole(
    userId: string,
    role: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const validRoles = ["user", "supporter", "admin"];
      if (!validRoles.includes(role)) {
        return {
          success: false,
          message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        };
      }

      await this.adminRepository.changeUserRole(userId, role);
      return {
        success: true,
        message: "User role updated successfully",
      };
    } catch (error) {
      console.error("Error changing user role:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal error changing role",
      };
    }
  }

  async getReports(): Promise<{
    reports: ReportWithDetails[];
    total: number;
  }> {
    const reports = await this.adminRepository.getReports();
    return {
      reports,
      total: reports.length,
    };
  }

  async deleteReport(reportId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.adminRepository.deleteReport(reportId);
      return {
        success: true,
        message: "Report deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting report:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal error deleting report",
      };
    }
  }

  async getTotalUsers(): Promise<{
    total: number;
  }> {
    const total = await this.adminRepository.getTotalUsers();
    return { total };
  }

  /** Get all users with pagination */
  async getAllUsersPaginated(
    page: number,
    limit: number,
    sortBy: "created_at" | "name" | "email" = "created_at",
    sortOrder: "asc" | "desc" = "desc",
    search?: string,
  ): Promise<{
    users: UserSearchResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.adminRepository.getAllUsersPaginated(
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    );

    return {
      ...result,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
