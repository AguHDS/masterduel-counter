import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { AdminBanResponse } from "@/shared/dtos/admin/AdminBanRequest.dto";
import { validateStringParam } from "@/shared/utils/paramValidation";

export const unbanUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;

    const userIdString = validateStringParam(userId);

    if (!userIdString) {
      const response: AdminBanResponse = {
        success: false,
        error: "Invalid user ID",
      };
      res.status(400).json(response);
      return;
    }

    const adminService = getDependencies().getAdminService();
    const result = await adminService.unbanUser(userIdString);

    if (!result.success) {
      const response: AdminBanResponse = {
        success: false,
        error: result.message,
      };
      res.status(400).json(response);
      return;
    }

    const response: AdminBanResponse = {
      success: true,
      message: result.message,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in unbanUserController:", error);

    const response: AdminBanResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    res.status(500).json(response);
  }
};
