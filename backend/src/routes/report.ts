import { Router } from "express";
import { createReportController } from "@/http/controllers/createReportController.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";

const router = Router();

// Report a user (requires authentication)
router.post("/", requireAuth, createReportController);

export default router;
