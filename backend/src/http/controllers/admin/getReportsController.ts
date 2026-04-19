import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import {
  AdminReportsResponse,
  AdminReportItem,
} from "@/shared/dtos/admin/AdminReportsResponse.dto.js";
import { ReportWithDetails } from "@/domain/Report.js";

export const getReportsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const adminService = getDependencies().getAdminService();
    const result = await adminService.getReports();

    const reportItems: AdminReportItem[] = result.reports.map(
      (report: ReportWithDetails) => ({
        id: report.id,
        reporterId: report.reporterId,
        reporterName: report.reporterName,
        reporterEmail: report.reporterEmail,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
        // Propiedades opcionales
        ...(report.reportedUserId !== undefined && {
          reportedUserId: report.reportedUserId,
        }),
        ...(report.reportedUserName !== undefined && {
          reportedUserName: report.reportedUserName,
        }),
        ...(report.reportedInstanceId !== undefined && {
          reportedInstanceId: report.reportedInstanceId,
        }),
        ...(report.reportedInstanceTitle !== undefined && {
          reportedInstanceTitle: report.reportedInstanceTitle,
        }),
        ...(report.reportedInstanceAuthorId !== undefined && {
          reportedInstanceAuthorId: report.reportedInstanceAuthorId,
        }),
        ...(report.reportedInstanceAuthorName !== undefined && {
          reportedInstanceAuthorName: report.reportedInstanceAuthorName,
        }),
        ...(report.reportedInstanceArchetypeId !== undefined && {
          reportedInstanceArchetypeId: report.reportedInstanceArchetypeId,
        }),
        ...(report.reportedInstanceArchetypeName !== undefined && {
          reportedInstanceArchetypeName: report.reportedInstanceArchetypeName,
        }),
        ...(report.reportedInstanceGuideType !== undefined && {
          reportedInstanceGuideType: report.reportedInstanceGuideType,
        }),
      }),
    );

    const response: AdminReportsResponse = {
      success: true,
      data: {
        reports: reportItems,
        total: result.total,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getReportsController:", error);

    const response: AdminReportsResponse = {
      success: false,
      data: {
        reports: [],
        total: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    res.status(500).json(response);
  }
};
