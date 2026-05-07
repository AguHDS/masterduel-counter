import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getTrendingUserRankingController = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    // Default to current month if not provided
    let month = req.query.month as string;
    if (!month) {
      month = new Date().toISOString().slice(0, 7); // YYYY-MM
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      res.status(400).json({
        success: false,
        message: "Invalid month format. Expected YYYY-MM",
      });
      return;
    }

    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
      return;
    }

    const rankingService = getDependencies().getRankingService();
    const result = await rankingService.getTrendingUserRanking(
      month,
      page,
      limit,
    );

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Error getting trending user ranking:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get trending user ranking",
    });
  }
};
