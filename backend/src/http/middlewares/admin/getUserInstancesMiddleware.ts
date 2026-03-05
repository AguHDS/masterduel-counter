import { Request, Response, NextFunction } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { validateStringParam } from "@/shared/utils/paramValidation.js";

interface ValidatedUserIdRequest extends Request {
  validatedUserId?: string;
}

export const getUserInstancesMiddleware = async (
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
        error: "Invalid or missing user ID",
      });
    }

    const dependencies = getDependencies();
    const adminService = dependencies.getAdminService();
    const userResult = await adminService.getUserByIdAdminPanel(userIdString);

    if (!userResult.user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    (req as ValidatedUserIdRequest).validatedUserId = userIdString;

    next();
  } catch (error) {
    console.error("Error in getUserInstancesMiddleware:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
