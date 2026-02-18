import { Router } from "express";
import { registerArchetypeController } from "@/http/controllers/archetypes/registerArchetypeController";
import { registerArchetypeMiddleware } from "@/http/middlewares/archetypes/registerArchetypeMiddleware";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware";
import { getArchetypeWithHeaderController } from "@/http/controllers/archetypes/getArchetypeWithHeaderController";

const router = Router();

/** Register a new guide for an archetype */
router.post(
  "/:id/register",
  requireAuth,
  registerArchetypeMiddleware,
  registerArchetypeController,
);

/** Get archetype guide with its header card to display as list */
router.get(
  "/:id/with-header",
  getArchetypeWithHeaderController,
);

export default router;
