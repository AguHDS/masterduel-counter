import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { AdminUserInstancesResponse } from "@/shared/dtos/admin/AdminUserInstancesResponse.dto";

interface ValidatedUserIdRequest extends Request {
  validatedUserId?: string;
}

export const getUserInstancesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedUserId = (req as ValidatedUserIdRequest).validatedUserId;

    if (!validatedUserId) {
      const response: AdminUserInstancesResponse = {
        success: false,
        data: {
          instances: [],
          total: 0,
        },
        error: "User ID not validated",
      };
      res.status(400).json(response);
      return;
    }

    const adminService = getDependencies().getAdminService();
    const result =
      await adminService.getUserInstancesAdminPanel(validatedUserId);

    const response: AdminUserInstancesResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getUserInstancesController:", error);

    const response: AdminUserInstancesResponse = {
      success: false,
      data: {
        instances: [],
        total: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    res.status(500).json(response);
  }
};
