import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Get the best trending achievement for a specific guide (used in user profile) */
export const getGuideBestTrendingController = async (
  req: Request,
  res: Response,
) => {
  try {
    const guideIdParam = Array.isArray(req.params.guideId)
      ? req.params.guideId[0]
      : req.params.guideId;
    const guideId = parseInt(guideIdParam);

    if (isNaN(guideId) || guideId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid guide ID",
      });
      return;
    }

    const rankingService = getDependencies().getRankingService();
    const bestTrending = await rankingService.getGuideBestTrending(guideId);

    res.status(200).json({ success: true, bestTrending });
  } catch (error) {
    console.error("Error getting guide best trending:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get guide best trending",
    });
  }
};
