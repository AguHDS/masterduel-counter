import { Router } from "express";
import { toggleInstanceFavoriteController } from "@/http/controllers/guides/toggleInstanceFavoriteController.js";
import { checkGuideFavoriteStatusController } from "@/http/controllers/guides/checkGuideFavoriteStatusController.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";

const router = Router();

// Toggle favorite on a guide
router.post(
  "/archetypes/:archetypeId/instances/:instanceId/favorite",
  requireAuth,
  toggleInstanceFavoriteController
);

// Check favorite status for a guide
router.get(
  "/archetypes/:archetypeId/instances/:instanceId/favorite/status",
  requireAuth,
  checkGuideFavoriteStatusController
);

export default router;
