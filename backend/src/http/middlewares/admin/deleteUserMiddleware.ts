import { Request, Response, NextFunction } from "express";
import { getDependencies } from "@/compositionRoot";
import { validateStringParam } from "@/shared/utils/paramValidation";

export const deleteUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    const userResult = await adminService.getUserByIdAdminPanel(userIdString);

    if (!userResult.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting other administrators
    const currentUser = req.user;
    if (
      userResult.user.role === "admin" &&
      userResult.user.id !== currentUser?.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete another administrator",
      });
    }

    // Store the user information in the request to use in the controller
    (req as any).userToDelete = userResult.user;

    next();
  } catch (error) {
    console.error("Error in deleteUserMiddleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
