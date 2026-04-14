import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getGuideRankingController = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
      return;
    }

    const rankingService = getDependencies().getRankingService();
    const result = await rankingService.getGuideRanking(page, limit);

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Error getting guide ranking:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get guide ranking",
    });
  }
};
