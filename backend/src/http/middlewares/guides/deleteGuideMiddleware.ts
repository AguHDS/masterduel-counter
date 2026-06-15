import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../auth/authMiddleware.js";

export const validateDeleteGuide = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const instanceIdParam = req.params.instanceId;
    const userId = (req as AuthenticatedRequest).user?.id;
    const userRole = (req as AuthenticatedRequest).user?.role;

    // Check authentication
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Validate instance ID
    if (typeof instanceIdParam !== "string") {
      res.status(400).json({ success: false, error: "Invalid guide ID" });
      return;
    }

    const instanceId = parseInt(instanceIdParam);
    if (isNaN(instanceId)) {
      res.status(400).json({ success: false, error: "Invalid guide ID" });
      return;
    }

    // Attach validated data to request
    req.validatedDeleteGuideData = {
      instanceId,
      userId,
      userRole,
    };

    next();
  } catch (error) {
    console.error("[DeleteGuideMiddleware] Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
