import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { validateNumberParam } from "@/shared/utils/paramValidation.js";

export const deleteGuideRequestController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { requestId } = req.params;
    const parsedRequestId = validateNumberParam(requestId);

    if (!parsedRequestId) {
      res.status(400).json({
        success: false,
        error: "Invalid request ID",
      });
      return;
    }

    const adminService = getDependencies().getAdminService();
    const result = await adminService.deleteGuideRequest(parsedRequestId);

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
    console.error("Error in deleteGuideRequestController:", error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};