import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../authMiddleware";

export const validateDeleteRecommendedDeck = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const instanceIdParam = req.params.instanceId;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (typeof instanceIdParam !== "string") {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceId = parseInt(instanceIdParam);
    if (isNaN(instanceId)) {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    // Attach validated data to request
    req.validatedDeleteData = {
      instanceId,
      userId,
    };

    next();
  } catch (error) {
    console.error("[DeleteRecommendedDeckMiddleware] Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
