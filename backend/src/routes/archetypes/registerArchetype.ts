import { Router } from "express";
import { registerGuideController } from "@/http/controllers/archetypes/registerGuideController.js";
import { registerArchetypeMiddleware } from "@/http/middlewares/archetypes/registerArchetypeMiddleware.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import { getArchetypeWithHeaderController } from "@/http/controllers/archetypes/getArchetypeWithHeaderController.js";

const router = Router();

/** Register a new guide for an archetype */
router.post(
  "/:id/register",
  requireAuth,
  registerArchetypeMiddleware,
  registerGuideController,
);

/** Get archetype guide with its header card to display as list */
router.get(
  "/:id/with-header",
  getArchetypeWithHeaderController,
);

export default router;
