import { Request, Response, NextFunction } from "express";

export const validateGetRecommendedDeck = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const instanceIdParam = req.params.instanceId;

    if (typeof instanceIdParam !== "string") {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceId = parseInt(instanceIdParam);
    if (isNaN(instanceId)) {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    // Attach validated instance ID directly to req object
    req.validatedInstanceId = instanceId;

    next();
  } catch (error) {
    console.error("[GetRecommendedDeckMiddleware] Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
