import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../auth/authMiddleware.js";

export const validateCreateOrUpdateRecommendedDeck = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const instanceIdParam = req.params.instanceId;
    const userId = (req as AuthenticatedRequest).user?.id;
    const { title, mainDeckCards, extraDeckCards, sideDeckCards } = req.body;

    // Check authentication
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Validate instance ID
    if (typeof instanceIdParam !== "string") {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceId = parseInt(instanceIdParam);
    if (isNaN(instanceId)) {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    // Validate deck data
    if (!Array.isArray(mainDeckCards) || !Array.isArray(extraDeckCards)) {
      res.status(400).json({ success: false, error: "Invalid deck data" });
      return;
    }

    // Validate side deck if provided
    if (sideDeckCards !== undefined && !Array.isArray(sideDeckCards)) {
      res.status(400).json({ success: false, error: "Invalid side deck data" });
      return;
    }

    // Check if deck has content
    const hasContent = mainDeckCards.length > 0 || extraDeckCards.length > 0;

    if (!hasContent) {
      res.status(400).json({
        success: false,
        error:
          "Cannot save deck with no cards. Use the DELETE endpoint to remove the deck.",
      });
      return;
    }

    // Attach validated data to request
    req.validatedDeckData = {
      instanceId,
      userId,
      title,
      mainDeckCards,
      extraDeckCards,
      sideDeckCards: sideDeckCards || [],
    };

    next();
  } catch (error) {
    console.error("[CreateOrUpdateMiddleware] Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
