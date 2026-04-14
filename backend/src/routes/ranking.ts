import express from "express";
import { getUserRankingController } from "@/http/controllers/ranking/getUserRankingController.js";
import { getGuideRankingController } from "@/http/controllers/ranking/getGuideRankingController.js";

const router = express.Router();

// Get user ranking (no auth required - public)
router.get("/", getUserRankingController);

// Get guide ranking (no auth required - public)
router.get("/guides", getGuideRankingController);

export default router;
