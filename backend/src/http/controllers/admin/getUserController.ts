import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { AdminUserResponse } from "@/shared/dtos/admin/AdminUserResponse.dto";

export const getUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rawUserId = req.params.userId;

    if (!rawUserId || Array.isArray(rawUserId)) {
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
        error: "Invalid userId parameter",
      };
      res.status(400).json(response);
      return;
    }

    const userId = rawUserId;

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
