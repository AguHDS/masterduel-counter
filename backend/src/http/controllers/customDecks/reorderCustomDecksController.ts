import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Reorders custom decks for a user in their profile */
export const reorderCustomDecksController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = req.validatedCustomDeckReorderData;

    if (!validatedData) {
      res
        .status(400)
        .json({ success: false, error: "Validation data not found" });
      return;
    }

    const { userId, deckOrders } = validatedData;

    const deckService = getDependencies().getCustomDeckService();

    // Reorder decks
    await deckService.reorderDecks(userId, { deckOrders });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[ReorderCustomDecksController] Error reordering decks:", error);

    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
};
