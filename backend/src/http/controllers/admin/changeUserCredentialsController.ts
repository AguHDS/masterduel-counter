import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { AdminChangeCredentialsResponse } from "@/shared/dtos/admin/AdminChangeCredentialsRequest.dto";
import { validateStringParam } from "@/shared/utils/paramValidation";

export const changeUserCredentialsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { username, email, password } = req.body;

    const userIdString = validateStringParam(userId);

    if (!userIdString) {
      const response: AdminChangeCredentialsResponse = {
        success: false,
        error: "Invalid user ID",
      };
      res.status(400).json(response);
      return;
    }

    if (!username && !email && !password) {
      const response: AdminChangeCredentialsResponse = {
        success: false,
        error: "At least one credential (username, email, or password) must be provided",
      };
      res.status(400).json(response);
      return;
    }

    const adminService = getDependencies().getAdminService();
    const result = await adminService.changeUserCredentials(userIdString, {
      username,
      email,
      password,
    });

    if (!result.success) {
      const response: AdminChangeCredentialsResponse = {
        success: false,
        error: result.message,
      };
      res.status(400).json(response);
      return;
    }

    const response: AdminChangeCredentialsResponse = {
      success: true,
      message: result.message,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in changeUserCredentialsController:", error);

    const response: AdminChangeCredentialsResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    res.status(500).json(response);
  }
};
