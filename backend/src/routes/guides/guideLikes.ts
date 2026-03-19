import { Router } from "express";
import { toggleInstanceLikeController } from "@/http/controllers/guides/toggleInstanceLikeController.js";
import { checkGuideLikeStatusController } from "@/http/controllers/guides/checkGuideLikeStatusController.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";

const router = Router();

// Toggle like on a guide
router.post(
  "/archetypes/:archetypeId/instances/:instanceId/like",
  requireAuth,
  toggleInstanceLikeController
);

// Get like status for a guide
router.get(
  "/archetypes/:archetypeId/instances/:instanceId/like/status",
  requireAuth,
  checkGuideLikeStatusController
);

export default router;
