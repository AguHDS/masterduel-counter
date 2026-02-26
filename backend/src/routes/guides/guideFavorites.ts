import { Router } from "express";
import { toggleInstanceFavoriteController } from "@/http/controllers/guides/toggleInstanceFavoriteController";
import { getInstanceFavoriteStatusController } from "@/http/controllers/guides/getInstanceFavoriteStatusController";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware";

const router = Router();

// Toggle favorite on an instance
router.post(
  "/archetypes/:archetypeId/instances/:instanceId/favorite",
  requireAuth,
  toggleInstanceFavoriteController
);

// Get favorite status for an instance
router.get(
  "/archetypes/:archetypeId/instances/:instanceId/favorite/status",
  requireAuth,
  getInstanceFavoriteStatusController
);

export default router;
