import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Creates a custom deck for a user in their profile */
export const createCustomDeckController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = req.validatedCustomDeckData;

    if (!validatedData) {
      res
        .status(400)
        .json({ success: false, error: "Validation data not found" });
      return;
    }

    const { userId, userRole, title, mainDeckCards, extraDeckCards, isPublic } = validatedData;

    const deckService = getDependencies().getCustomDeckService();

    // Check if user can create more decks
    const canCreate = await deckService.canUserCreateDeck(userId, userRole);
    if (!canCreate) {
      res
        .status(403)
        .json({
          success: false,
          error: "You have reached the maximum number of decks allowed",
        });
      return;
    }

    // Create deck
    const deck = await deckService.createDeck({
      userId,
      title,
      mainDeckCards,
      extraDeckCards,
      isPublic,
    });

    res.status(201).json({ success: true, deck });
  } catch (error) {
    console.error("[CreateCustomDeckController] Error creating deck:", error);

    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
};
