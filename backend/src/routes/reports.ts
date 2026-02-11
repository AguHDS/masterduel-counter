import { Router } from "express";
import { createReportController } from "@/http/controllers/createReportController";
import { requireAuth } from "@/http/middlewares/authMiddleware";

const router = Router();

// Create a report (requires authentication)
router.post("/", requireAuth, createReportController);

export default router;
