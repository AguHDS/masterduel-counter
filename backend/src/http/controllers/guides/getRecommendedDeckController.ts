import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getRecommendedDeckController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const instanceId = req.validatedInstanceId;

    if (!instanceId) {
      res
        .status(400)
        .json({ success: false, error: "Instance ID not validated" });
      return;
    }

    const deckService = getDependencies().getRecommendedDeckService();
    const deck = await deckService.getDeckByInstanceId(instanceId);

    if (!deck) {
      res.status(204).send();
      return;
    }

    res.status(200).json({ success: true, deck });
  } catch (error) {
    console.error(
      "[GetRecommendedDeckController] Error fetching recommended deck:",
      error,
    );
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
