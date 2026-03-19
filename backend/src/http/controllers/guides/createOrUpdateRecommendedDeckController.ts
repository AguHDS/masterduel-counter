import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Creates or updates a recommended deck for a guide */
export const createOrUpdateRecommendedDeckController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = req.validatedDeckData;

    if (!validatedData) {
      res
        .status(400)
        .json({ success: false, error: "Validation data not found" });
      return;
    }

    const { instanceId, userId, title, mainDeckCards, extraDeckCards } =
      validatedData;

    // Verify instance ownership
    const instanceService = getDependencies().getInstanceService();
    const instance = await instanceService.getGuideById(instanceId);

    if (!instance) {
      res.status(404).json({ success: false, error: "Guide not found" });
      return;
    }

    if (instance.userId !== userId) {
      res
        .status(403)
        .json({
          success: false,
          error: "You can only edit your own guides",
        });
      return;
    }

    const deckService = getDependencies().getRecommendedDeckService();

    // Check if deck exists
    const existingDeck = await deckService.getDeckByInstanceId(instanceId);

    let deck;
    if (existingDeck) {
      // Update existing deck
      deck = await deckService.updateDeck(instanceId, {
        title,
        mainDeckCards,
        extraDeckCards,
      });
    } else {
      // Create new deck
      deck = await deckService.createDeck({
        instanceId,
        title,
        mainDeckCards,
        extraDeckCards,
      });
    }

    res.status(200).json({ success: true, deck });
  } catch (error) {
    console.error(
      "[CreateOrUpdateController] Error saving recommended deck:",
      error,
    );

    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
};
