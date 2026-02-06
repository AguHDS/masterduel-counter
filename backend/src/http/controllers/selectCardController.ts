import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

/** Select a card (temporarily creating it if it does not exist in the database) */
export const selectCardController = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.body;

    const cardService = getDependencies().getCardService();
    const card = await cardService.selectCard(cardId);

    res.json({ card });
  } catch (error) {
    console.error("Error selecting card:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({
        error: "Card not found",
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to select card",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
