import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { CreateReportResponse } from "@/shared/dtos/CreateReportRequest.dto.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const createReportController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user?.id;

    if (!userId) {
      const response: CreateReportResponse = {
        success: false,
        error: "User not authenticated",
      };
      res.status(401).json(response);
      return;
    }

    const { reportedUserId, reportedInstanceId, reason } = req.body;

    // Validate input
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      const response: CreateReportResponse = {
        success: false,
        error: "Report reason is required",
      };
      res.status(400).json(response);
      return;
    }

    if (!reportedUserId && !reportedInstanceId) {
      const response: CreateReportResponse = {
        success: false,
        error: "Must report either a user or an instance",
      };
      res.status(400).json(response);
      return;
    }

    const reportService = getDependencies().getReportService();
    const result = await reportService.createReport({
      reporterId: userId,
      reportedUserId: reportedUserId || null,
      reportedInstanceId: reportedInstanceId || null,
      reason: reason.trim(),
    });

    if (!result.success) {
      const response: CreateReportResponse = {
        success: false,
        error: result.message,
      };
      res.status(400).json(response);
      return;
    }

    const response: CreateReportResponse = {
      success: true,
      data: {
        reportId: result.reportId!,
      },
      message: result.message,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in createReportController:", error);

    const response: CreateReportResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    res.status(500).json(response);
  }
};
