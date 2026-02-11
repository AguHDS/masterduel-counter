import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import {
  AdminReportsResponse,
  AdminReportItem,
} from "@/shared/dtos/admin/AdminReportsResponse.dto";

export const getReportsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const adminService = getDependencies().getAdminService();
    const result = await adminService.getReports();

    const reportItems: AdminReportItem[] = result.reports.map((report) => ({
      id: report.id,
      reporterId: report.reporterId,
      reporterName: report.reporterName,
      reporterEmail: report.reporterEmail,
      reportedUserId: report.reportedUserId || null,
      reportedUserName: report.reportedUserName || null,
      reportedInstanceId: report.reportedInstanceId || null,
      reportedInstanceTitle: report.reportedInstanceTitle || null,
      reportedInstanceAuthorId: report.reportedInstanceAuthorId || null,
      reportedInstanceAuthorName: report.reportedInstanceAuthorName || null,
      reportedInstanceArchetypeId: report.reportedInstanceArchetypeId || null,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    }));

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
