import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Gets the card pairs of a specific instance by its ID */
export const getInstanceCardPairsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    if (typeof id !== 'string') {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }
    const instanceId = parseInt(id);

    if (isNaN(instanceId) || instanceId <= 0) {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const cardPairRepository = getDependencies().getCardPairRepository();
    const cardPairs = await cardPairRepository.findByInstanceIdWithDetails(instanceId);

    res.status(200).json({
      success: true,
      cardPairs,
    });
  } catch (error) {
    console.error("Error fetching instance card pairs:", error);

    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
};
