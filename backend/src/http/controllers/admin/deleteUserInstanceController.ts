import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { AdminDeleteInstanceResponse } from "@/shared/dtos/admin/AdminDeleteInstanceResponse.dto.js";
import { validateStringParam, validateNumberParam } from "@/shared/utils/paramValidation.js";

export const deleteUserInstanceController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, instanceId } = req.params;

    const userIdString = validateStringParam(userId);
    const instanceIdNumber = validateNumberParam(instanceId);

    if (!userIdString || !instanceIdNumber) {
      const response: AdminDeleteInstanceResponse = {
        success: false,
        error: "Invalid user ID or instance ID",
      };
      res.status(400).json(response);
      return;
    }

    const adminService = getDependencies().getAdminService();
    const result = await adminService.deleteUserGuide(
      userIdString,
      instanceIdNumber,
    );

    if (!result.success) {
      const response: AdminDeleteInstanceResponse = {
        success: false,
        error: result.message,
      };
      res.status(404).json(response);
      return;
    }

    const response: AdminDeleteInstanceResponse = {
      success: true,
      message: result.message,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in deleteUserInstanceController:", error);

    const response: AdminDeleteInstanceResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    res.status(500).json(response);
  }
};
