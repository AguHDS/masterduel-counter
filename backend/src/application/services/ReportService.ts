import { ReportRepository } from "@/domain/ports/ReportRepository";
import { ReportService as ReportServicePort } from "@/application/ports/ReportService";
import type { ReportCreateDTO } from "@/domain/Report";
import { PrismaClient } from "@prisma/client";

export class ReportServiceImpl implements ReportServicePort {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly prisma: PrismaClient
  ) {}

  async createReport(data: ReportCreateDTO): Promise<{
    success: boolean;
    reportId?: number;
    message: string;
  }> {
    try {
      // Validate that at least one target is provided
      if (!data.reportedUserId && !data.reportedInstanceId) {
        return {
          success: false,
          message: "Must report either a user or an instance",
        };
      }

      // Validate reason
      if (!data.reason || data.reason.trim().length === 0) {
        return {
          success: false,
          message: "Report reason is required",
        };
      }

      if (data.reason.length > 500) {
        return {
          success: false,
          message: "Report reason must be 500 characters or less",
        };
      }

      // Validate that the reported user exists (if reporting a user)
      if (data.reportedUserId) {
        const reportedUser = await this.prisma.user.findUnique({
          where: { id: data.reportedUserId },
          select: { id: true }
        });

        if (!reportedUser) {
          return {
            success: false,
            message: "The user you are trying to report does not exist or has been deleted",
          };
        }
      }

      // Validate that the reported instance exists (if reporting an instance)
      if (data.reportedInstanceId) {
        const instance = await this.prisma.archetypeInstance.findUnique({
          where: { id: data.reportedInstanceId },
          select: { id: true }
        });

        if (!instance) {
          return {
            success: false,
            message: "The instance you are trying to report does not exist or has been deleted",
          };
        }
      }

      const report = await this.reportRepository.createReport(data);

      return {
        success: true,
        reportId: report.id,
        message: "Report submitted successfully",
      };
    } catch (error) {
      console.error("Error creating report:", error);
      
      // Handle Prisma foreign key constraint error
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
        return {
          success: false,
          message: "The user or instance you are trying to report no longer exists",
        };
      }
      
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal error creating report",
      };
    }
  }
}