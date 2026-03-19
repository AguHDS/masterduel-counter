import { Router } from "express";
import { toggleGuideFavoriteController } from "@/http/controllers/guides/toggleGuideFavoriteController.js";
import { checkGuideFavoriteStatusController } from "@/http/controllers/guides/checkGuideFavoriteStatusController.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";

const router = Router();

/** Toggle favorite on a guide */
router.post(
  "/archetypes/:archetypeId/instances/:instanceId/favorite",
  requireAuth,
  toggleGuideFavoriteController
);

/** Check favorite status for a guide */
router.get(
  "/archetypes/:archetypeId/instances/:instanceId/favorite/status",
  requireAuth,
  checkGuideFavoriteStatusController
);

export default router;
