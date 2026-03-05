import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { validateStringParam } from "@/shared/utils/paramValidation.js";

/** Retrieves all custom decks for a specific user */
export const getCustomDecksController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = validateStringParam(req.params.userId);

    if (!userId) {
      res
        .status(400)
        .json({ success: false, error: "User ID not provided" });
      return;
    }

    const deckService = getDependencies().getCustomDeckService();
    const decks = await deckService.getDecksByUserId(userId);

    res.status(200).json({ success: true, decks });
  } catch (error) {
    console.error("[GetCustomDecksController] Error fetching decks:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
