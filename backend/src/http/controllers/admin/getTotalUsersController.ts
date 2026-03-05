import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getTotalUsersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const adminService = getDependencies().getAdminService();
    const result = await adminService.getTotalUsers();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting total users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get total users",
    });
  }
};
