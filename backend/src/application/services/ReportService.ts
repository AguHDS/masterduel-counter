import { ReportRepository } from "@/domain/ports/ReportRepository";
import { ReportService as ReportServicePort } from "@/application/ports/ReportService";
import type { ReportCreateDTO } from "@/domain/Report";

export class ReportServiceImpl implements ReportServicePort {
  constructor(private readonly reportRepository: ReportRepository) {}

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

      const report = await this.reportRepository.createReport(data);

      return {
        success: true,
        reportId: report.id,
        message: "Report submitted successfully",
      };
    } catch (error) {
      console.error("Error creating report:", error);
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
