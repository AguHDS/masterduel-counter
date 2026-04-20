import { ReportRepository } from "@/domain/ports/ReportRepository.js";
import { ReportApplicationPort } from "@/application/ports/ReportApplicationPort.js";
import { UserRepository } from "@/domain/ports/UserRepository.js";
import { ProfileRepository } from "@/domain/ports/ProfileRepository.js";
import { GuideRepository } from "@/domain/ports/GuideRepository.js";
import type { ReportCreateDTO } from "@/domain/Report.js";

export class ReportApplicationService implements ReportApplicationPort {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly guideRepository: GuideRepository,
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

      let resolvedReportedUserId = data.reportedUserId ?? null;

      // Validate that the reported user exists (if reporting a user)
      if (resolvedReportedUserId) {
        resolvedReportedUserId = await this.profileRepository.resolvePublicUserId(
          resolvedReportedUserId,
        );

        const reportedUser = await this.userRepository.findUserById(
          resolvedReportedUserId,
        );

        if (!reportedUser) {
          return {
            success: false,
            message: "The user you are trying to report does not exist or has been deleted",
          };
        }
      }

      // Validate that the reported instance exists (if reporting an instance)
      if (data.reportedInstanceId) {
        const instance = await this.guideRepository.findArchetypeInstanceById(
          data.reportedInstanceId,
        );

        if (!instance) {
          return {
            success: false,
            message: "The instance you are trying to report does not exist or has been deleted",
          };
        }
      }

      const report = await this.reportRepository.createReport({
        ...data,
        reportedUserId: resolvedReportedUserId || null,
      });

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