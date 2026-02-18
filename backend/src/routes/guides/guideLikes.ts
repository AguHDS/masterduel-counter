import { Router } from "express";
import { toggleInstanceLikeController } from "@/http/controllers/guides/toggleInstanceLikeController";
import { getInstanceLikeStatusController } from "@/http/controllers/guides/getInstanceLikeStatusController";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware";

const router = Router();

// Toggle like on an instance
router.post(
  "/archetypes/:archetypeId/instances/:instanceId/like",
  requireAuth,
  toggleInstanceLikeController
);

// Get like status for an instance
router.get(
  "/archetypes/:archetypeId/instances/:instanceId/like/status",
  requireAuth,
  getInstanceLikeStatusController
);

export default router;
