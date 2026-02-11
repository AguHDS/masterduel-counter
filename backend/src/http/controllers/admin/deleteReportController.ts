import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { validateNumberParam } from "@/shared/utils/paramValidation";

export const deleteReportController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reportId } = req.params;

    const reportIdNumber = validateNumberParam(reportId);

    if (!reportIdNumber) {
      res.status(400).json({
        success: false,
        error: "Invalid report ID",
      });
      return;
    }

    const adminService = getDependencies().getAdminService();
    const result = await adminService.deleteReport(reportIdNumber);

    if (!result.success) {
      res.status(404).json({
        success: false,
        error: result.message,
      });
      return;
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in deleteReportController:", error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
