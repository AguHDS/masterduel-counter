import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../auth/authMiddleware";

/** Validates the data for updating a custom deck for user profiles */
export const validateUpdateCustomDeck = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const deckIdParam = req.params.deckId;
    const userId = (req as AuthenticatedRequest).user?.id;
    const { title, mainDeckCards, extraDeckCards } = req.body;

    // Check authentication
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Validate deck ID
    if (typeof deckIdParam !== "string") {
      res.status(400).json({ success: false, error: "Invalid deck ID" });
      return;
    }

    const deckId = parseInt(deckIdParam);
    if (isNaN(deckId)) {
      res.status(400).json({ success: false, error: "Invalid deck ID" });
      return;
    }

    // Validate deck data if provided
    if (mainDeckCards !== undefined && !Array.isArray(mainDeckCards)) {
      res.status(400).json({ success: false, error: "Invalid main deck data" });
      return;
    }

    if (extraDeckCards !== undefined && !Array.isArray(extraDeckCards)) {
      res.status(400).json({ success: false, error: "Invalid extra deck data" });
      return;
    }

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        res.status(400).json({ success: false, error: "Title cannot be empty" });
        return;
      }

      if (title.length > 100) {
        res.status(400).json({ success: false, error: "Title is too long (max 100 characters)" });
        return;
      }
    }

    // Check if at least one field is being updated
    if (title === undefined && mainDeckCards === undefined && extraDeckCards === undefined) {
      res.status(400).json({
        success: false,
        error: "No fields to update",
      });
      return;
    }

    // Attach validated data to request
    req.validatedCustomDeckUpdateData = {
      deckId,
      userId,
      title: title ? title.trim() : undefined,
      mainDeckCards,
      extraDeckCards,
    };

    next();
  } catch (error) {
    console.error("[UpdateCustomDeckMiddleware] Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
