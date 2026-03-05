import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { validateStringParam } from "@/shared/utils/paramValidation.js";

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userIdString = validateStringParam(userId);

    if (!userIdString) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing user ID",
      });
    }

    const dependencies = getDependencies();
    const adminService = dependencies.getAdminService();

    const result = await adminService.deleteUser(userIdString);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        userId: userIdString,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user?.id,
      },
    });
  } catch (error) {
    console.error("Error en deleteUserController:", error);

    if (error instanceof Error) {
      if (error.message.includes("P2003")) {
        return res.status(409).json({
          success: false,
          message: "Cannot delete user because it has associated data",
        });
      }

      if (error.message.includes("P2025")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (error.message.includes("PrismaClientKnownRequestError")) {
        return res.status(500).json({
          success: false,
          message: "Database error while deleting user",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting user",
    });
  }
};
