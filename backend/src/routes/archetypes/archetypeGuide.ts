import { Router } from "express";
import { registerGuideController } from "@/http/controllers/archetypes/registerGuideController.js";
import { registerGuideMiddleware } from "@/http/middlewares/archetypes/registerGuideMiddleware.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import { getArchetypeWithHeaderController } from "@/http/controllers/archetypes/getArchetypeWithHeaderController.js";

const router = Router();

/** Registers or updates a guide and mark the archetype as registered */
router.post(
  "/:id/register",
  requireAuth,
  registerGuideMiddleware,
  registerGuideController,
);

/** Get archetype guide with its header card to display as list */
router.get(
  "/:id/with-header",
  getArchetypeWithHeaderController,
);

export default router;
