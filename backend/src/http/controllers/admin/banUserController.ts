import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { AdminBanResponse } from "@/shared/dtos/admin/AdminBanRequest.dto";
import { validateStringParam } from "@/shared/utils/paramValidation";

export const banUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { reason, expiresAt } = req.body;

    const userIdString = validateStringParam(userId);

    if (!userIdString) {
      const response: AdminBanResponse = {
        success: false,
        error: "Invalid user ID",
      };
      res.status(400).json(response);
      return;
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      const response: AdminBanResponse = {
        success: false,
        error: "Ban reason is required",
      };
      res.status(400).json(response);
      return;
    }

    // Parse expiresAt if provided
    let expiresAtDate: Date | null = null;
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt);
      if (isNaN(expiresAtDate.getTime())) {
        const response: AdminBanResponse = {
          success: false,
          error: "Invalid expiration date",
        };
        res.status(400).json(response);
        return;
      }
    }

    const adminService = getDependencies().getAdminService();
    const result = await adminService.banUser(
      userIdString,
      reason,
      expiresAtDate,
    );

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
    console.error("Error in banUserController:", error);

    const response: AdminBanResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    res.status(500).json(response);
  }
};
