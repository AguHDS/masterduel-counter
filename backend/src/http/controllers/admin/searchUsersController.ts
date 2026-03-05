import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { AdminUserSearchResponse } from "@/shared/dtos/admin/AdminUserSearchResponse.dto.js";

export const searchUsersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { q, limit } = req.query;
    const searchQuery = q as string;
    const resultLimit = limit ? parseInt(limit as string) : 10;

    const adminService = getDependencies().getAdminService();
    const result = await adminService.searchUsersAdminPanel(
      searchQuery,
      resultLimit,
    );

    const response: AdminUserSearchResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in searchUsersController:", error);
    const response: AdminUserSearchResponse = {
      success: false,
      data: {
        users: [],
        total: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
    res.status(500).json(response);
  }
};
