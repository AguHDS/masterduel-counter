import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../auth/authMiddleware";

/** Validates the data for creating a custom deck for user profiles */
export const validateCreateCustomDeck = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const userRole = (req as AuthenticatedRequest).user?.role;
    const { title, mainDeckCards, extraDeckCards, isPublic } = req.body;

    // Check authentication
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Validate deck data
    if (!Array.isArray(mainDeckCards) || !Array.isArray(extraDeckCards)) {
      res.status(400).json({ success: false, error: "Invalid deck data" });
      return;
    }

    // Validate title
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      res.status(400).json({ success: false, error: "Title is required" });
      return;
    }

    if (title.length > 100) {
      res.status(400).json({ success: false, error: "Title is too long (max 100 characters)" });
      return;
    }

    // Check if deck has content
    const hasContent = mainDeckCards.length > 0 || extraDeckCards.length > 0;

    if (!hasContent) {
      res.status(400).json({
        success: false,
        error: "Cannot save deck with no cards",
      });
      return;
    }

    // Attach validated data to request
    req.validatedCustomDeckData = {
      userId,
      userRole: userRole || "user",
      title: title.trim(),
      mainDeckCards,
      extraDeckCards,
      isPublic: typeof isPublic === "boolean" ? isPublic : false,
    };

    next();
  } catch (error) {
    console.error("[CreateCustomDeckMiddleware] Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
