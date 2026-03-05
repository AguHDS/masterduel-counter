import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { validateStringParam } from "@/shared/utils/paramValidation.js";

interface ChangeRoleResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const changeUserRoleController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const userIdString = validateStringParam(userId);

    if (!userIdString) {
      const response: ChangeRoleResponse = {
        success: false,
        error: "Invalid user ID",
      };
      res.status(400).json(response);
      return;
    }

    if (!role || typeof role !== "string") {
      const response: ChangeRoleResponse = {
        success: false,
        error: "Role is required and must be a string",
      };
      res.status(400).json(response);
      return;
    }

    const adminService = getDependencies().getAdminService();
    const result = await adminService.changeUserRole(userIdString, role);

    if (!result.success) {
      const response: ChangeRoleResponse = {
        success: false,
        error: result.message,
      };
      res.status(400).json(response);
      return;
    }

    const response: ChangeRoleResponse = {
      success: true,
      message: result.message,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in changeUserRoleController:", error);

    const response: ChangeRoleResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    res.status(500).json(response);
  }
};
