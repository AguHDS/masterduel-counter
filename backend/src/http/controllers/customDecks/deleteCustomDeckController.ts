import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

/** Deletes a custom deck for a user in their profile */
export const deleteCustomDeckController = async (
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
    await deckService.deleteDeck(deckId, userId);

    res.status(200).json({ success: true, message: "Deck deleted successfully" });
  } catch (error) {
    console.error("[DeleteCustomDeckController] Error deleting deck:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
