import { Request, Response } from "express";
import { GetCardDetailsPort } from "@/application/ports/GetCardDetailsPort.js";

/** Generally used for tooltip purposes */
export const createGetCardDetailsController = (
  getCardDetails: GetCardDetailsPort,
) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const rawCardId = req.params.cardId;

      if (Array.isArray(rawCardId)) {
        res.status(400).json({ message: "Invalid card ID" });
        return;
      }

      const cardId = parseInt(rawCardId, 10);

      if (isNaN(cardId)) {
        res.status(400).json({ message: "Invalid card ID" });
        return;
      }

      const cardDetails = await getCardDetails.execute(cardId);

      if (!cardDetails) {
        res.status(404).json({ message: "Card not found" });
        return;
      }

      res.json(cardDetails);
    } catch (error) {
      console.error("Error getting card details:", error);
      res.status(500).json({
        message: "Failed to get card details",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
};
