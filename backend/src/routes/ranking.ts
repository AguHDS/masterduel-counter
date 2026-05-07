import express from "express";
import { getUserRankingController } from "@/http/controllers/ranking/getUserRankingController.js";
import { getGuideRankingController } from "@/http/controllers/ranking/getGuideRankingController.js";
import { getTrendingGuideRankingController } from "@/http/controllers/ranking/getTrendingGuideRankingController.js";
import { getTrendingUserRankingController } from "@/http/controllers/ranking/getTrendingUserRankingController.js";

const router = express.Router();

// Get user ranking
router.get("/", getUserRankingController);

// Get guide ranking
router.get("/guides", getGuideRankingController);

// Get trending guide ranking
router.get("/trending/guides", getTrendingGuideRankingController);

// Get trending user ranking
router.get("/trending/users", getTrendingUserRankingController);

export default router;
