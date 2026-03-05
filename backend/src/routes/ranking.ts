import express from "express";
import { getRankingController } from "@/http/controllers/ranking/getRankingController.js";

const router = express.Router();

// Get ranking (no auth required - public)
router.get("/", getRankingController);

export default router;
