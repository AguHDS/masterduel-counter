import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Get trending history for a specific user (used in user profile) */
export const getUserTrendingHistoryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    const rankingService = getDependencies().getRankingService();
    const history = await rankingService.getUserTrendingHistory(userId);

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Error getting user trending history:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get user trending history",
    });
  }
};
