import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/verifyAdminAuthMiddleware";

export const verifyAdminAuthController = async (
  req: Request,
  res: Response,
) => {
  try {
    const admin = (req as AuthenticatedRequest).admin;

    return res.status(200).json({
      success: true,
      authenticated: true,
      admin: {
        id: admin?.adminId,
        username: admin?.username,
      },
    });
  } catch (error) {
    console.error("[Verify Auth Controller Error]:", error);

    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "An error occurred during verification",
    });
  }
};
