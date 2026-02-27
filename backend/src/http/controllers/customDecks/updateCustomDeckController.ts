import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

/** Updates a specific custom deck for a user in their profile */
export const updateCustomDeckController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = req.validatedCustomDeckUpdateData;

    if (!validatedData) {
      res
        .status(400)
        .json({ success: false, error: "Validation data not found" });
      return;
    }

    const { deckId, userId, title, mainDeckCards, extraDeckCards } = validatedData;

    const deckService = getDependencies().getCustomDeckService();

    // Update deck
    const deck = await deckService.updateDeck(deckId, userId, {
      title,
      mainDeckCards,
      extraDeckCards,
    });

    res.status(200).json({ success: true, deck });
  } catch (error) {
    console.error("[UpdateCustomDeckController] Error updating deck:", error);

    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
};
