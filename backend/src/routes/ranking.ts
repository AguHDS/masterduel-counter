import express from "express";
import { getUserRankingController } from "@/http/controllers/ranking/getUserRankingController.js";
import { getGuideRankingController } from "@/http/controllers/ranking/getGuideRankingController.js";
import { getTrendingGuideRankingController } from "@/http/controllers/ranking/getTrendingGuideRankingController.js";
import { getTrendingUserRankingController } from "@/http/controllers/ranking/getTrendingUserRankingController.js";
import { getUserTrendingHistoryController } from "@/http/controllers/ranking/getUserTrendingHistoryController.js";
import { getGuideBestTrendingController } from "@/http/controllers/ranking/getGuideBestTrendingController.js";
import { getUserTrendingAchievementsController } from "@/http/controllers/ranking/getUserTrendingAchievementsController.js";

const router = express.Router();

// Get user ranking
router.get("/", getUserRankingController);

// Get guide ranking
router.get("/guides", getGuideRankingController);

// Get trending guide ranking
router.get("/trending/guides", getTrendingGuideRankingController);

// Get trending user ranking
router.get("/trending/users", getTrendingUserRankingController);

// Get user trending history
router.get("/user/:userId/trending-history", getUserTrendingHistoryController);

// Get guide best trending achievement
router.get("/guide/:guideId/best-trending", getGuideBestTrendingController);

// Get user trending achievements (both user and guide rankings)
router.get("/user/:userId/trending-achievements", getUserTrendingAchievementsController);

export default router;
