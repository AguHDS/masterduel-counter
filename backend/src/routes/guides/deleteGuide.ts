import { Router } from "express";
import { requireAuth } from "@/http/middlewares/authMiddleware";
import { validateDeleteGuide } from "@/http/middlewares/guides/deleteGuideMiddleware";
import { deleteGuideController } from "@/http/controllers/guides/deleteGuideController";

const router = Router();

/** Delete a guide by its ID (with ownership verification) */
router.delete(
  "/instances/:instanceId",
  requireAuth,
  validateDeleteGuide,
  deleteGuideController,
);

export default router;
