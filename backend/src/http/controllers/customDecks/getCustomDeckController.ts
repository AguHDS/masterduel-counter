import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Retrieves a specific custom deck for a user in their profile */
export const getCustomDeckController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deckIdParam = req.params.deckId;
    const userId = req.user?.id;

    if (!userId) {
      res
        .status(401)
        .json({ success: false, error: "User not authenticated" });
      return;
    }

    if (typeof deckIdParam !== "string") {
      res
        .status(400)
        .json({ success: false, error: "Invalid deck ID" });
      return;
    }

    const deckId = parseInt(deckIdParam);

    if (isNaN(deckId)) {
      res
        .status(400)
        .json({ success: false, error: "Invalid deck ID" });
      return;
    }

    const deckService = getDependencies().getCustomDeckService();
    const deck = await deckService.getDeckById(deckId, userId);

    if (!deck) {
      res.status(404).json({ success: false, error: "Deck not found" });
      return;
    }

    res.status(200).json({ success: true, deck });
  } catch (error) {
    console.error("[GetCustomDeckController] Error fetching deck:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
