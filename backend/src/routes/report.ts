import { Router } from "express";
import { createReportController } from "@/http/controllers/createReportController";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware";

const router = Router();

// Report a user (requires authentication)
router.post("/", requireAuth, createReportController);

export default router;
