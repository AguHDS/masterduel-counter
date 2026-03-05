import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { validateStringParam } from "@/shared/utils/paramValidation.js";
import { AdminUserResponse } from "@/shared/dtos/admin/AdminUserResponse.dto.js";

export const getUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId: rawUserId } = req.params;

    const userId = validateStringParam(rawUserId);

    if (!userId) {
      const response: AdminUserResponse = {
        success: false,
        data: {
          user: {
            id: "",
            username: "",
            email: "",
            role: "",
            created_at: "",
            is_banned: false,
          },
        },
        error: "Invalid or missing userId parameter",
      };
      res.status(400).json(response);
      return;
    }

    const adminService = getDependencies().getAdminService();
    const result = await adminService.getUserByIdAdminPanel(userId);

    if (!result.user) {
      const response: AdminUserResponse = {
        success: false,
        data: {
          user: {
            id: "",
            username: "",
            email: "",
            role: "",
            created_at: "",
            is_banned: false,
          },
        },
        error: "User not found",
      };
      res.status(404).json(response);
      return;
    }

    const response: AdminUserResponse = {
      success: true,
      data: {
        user: result.user,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getUserController:", error);
    const response: AdminUserResponse = {
      success: false,
      data: {
        user: {
          id: "",
          username: "",
          email: "",
          role: "",
          created_at: "",
          is_banned: false,
        },
      },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
    res.status(500).json(response);
  }
};
