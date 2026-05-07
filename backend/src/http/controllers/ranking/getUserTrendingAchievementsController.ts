import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Get all trending achievements for a user (both user rankings and guide rankings) - used in user profile */
export const getUserTrendingAchievementsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    if (!userId) {
      res.status(400).json({ success: false, error: "Missing userId" });
      return;
    }

    const rankingService = getDependencies().getRankingService();
    const achievements = await rankingService.getUserTrendingAchievements(userId);

    res.status(200).json({
      success: true,
      achievements,
    });
  } catch (error) {
    console.error("[getUserTrendingAchievementsController] Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve user trending achievements",
    });
  }
};
