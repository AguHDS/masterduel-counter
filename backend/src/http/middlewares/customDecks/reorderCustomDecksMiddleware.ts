import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../auth/authMiddleware.js";

/** Validates the data for reordering custom decks for user profiles */
export const validateReorderCustomDecks = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { deckOrders } = req.body;

    // Check authentication
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Validate deckOrders
    if (!Array.isArray(deckOrders)) {
      res.status(400).json({ success: false, error: "Invalid deckOrders data" });
      return;
    }

    // Validate each order
    for (const order of deckOrders) {
      if (typeof order !== "object" || order === null) {
        res.status(400).json({ success: false, error: "Invalid order object" });
        return;
      }

      if (typeof order.deckId !== "number" || !Number.isInteger(order.deckId)) {
        res.status(400).json({ success: false, error: "Invalid deckId in order" });
        return;
      }

      if (typeof order.displayOrder !== "number" || !Number.isInteger(order.displayOrder)) {
        res.status(400).json({ success: false, error: "Invalid displayOrder in order" });
        return;
      }
    }

    // Attach validated data to request
    (req as AuthenticatedRequest).validatedCustomDeckReorderData = {
      userId,
      deckOrders,
    };

    next();
  } catch (error) {
    console.error("[ValidateReorderCustomDecks] Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
