import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sortBy =
      (req.query.sortBy as "created_at" | "name" | "email") || "created_at";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";
    const search = (req.query.search as string) || undefined;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const adminService = getDependencies().getAdminService();
    const result = await adminService.getAllUsersPaginated(
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
