import express from "express";
import { getRankingController } from "@/http/controllers/ranking/getRankingController";

const router = express.Router();

// Get ranking (no auth required - public)
router.get("/", getRankingController);

export default router;
