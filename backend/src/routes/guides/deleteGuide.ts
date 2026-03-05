import { Router } from "express";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import { validateDeleteGuide } from "@/http/middlewares/guides/deleteGuideMiddleware.js";
import { deleteGuideController } from "@/http/controllers/guides/deleteGuideController.js";

const router = Router();

/** Delete a guide by its ID (with ownership verification) */
router.delete(
  "/instances/:instanceId",
  requireAuth,
  validateDeleteGuide,
  deleteGuideController,
);

export default router;
