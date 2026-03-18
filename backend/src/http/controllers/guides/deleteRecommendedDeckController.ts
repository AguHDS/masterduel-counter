import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const deleteRecommendedDeckController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = req.validatedDeleteData;

    if (!validatedData) {
      res
        .status(400)
        .json({ success: false, error: "Validation data not found" });
      return;
    }

    const { instanceId, userId } = validatedData;

    // Verify guide ownership
    const instanceService = getDependencies().getInstanceService();
    const instance = await instanceService.getGuideById(instanceId);

    if (!instance) {
      res.status(404).json({ success: false, error: "Instance not found" });
      return;
    }

    if (instance.userId !== userId) {
      res
        .status(403)
        .json({
          success: false,
          error: "You can only edit your own instances",
        });
      return;
    }

    const deckService = getDependencies().getRecommendedDeckService();
    await deckService.deleteDeck(instanceId);

    res
      .status(200)
      .json({
        success: true,
        message: "Recommended deck deleted successfully",
      });
  } catch (error) {
    console.error(
      "[DeleteRecommendedDeckController] Error deleting recommended deck:",
      error,
    );

    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
};
