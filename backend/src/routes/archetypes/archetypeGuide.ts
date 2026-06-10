import { Router } from "express";
import { registerGuideController } from "@/http/controllers/archetypes/registerGuideController.js";
import { registerGuideMiddleware } from "@/http/middlewares/archetypes/registerGuideMiddleware.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import { getArchetypeWithHeaderController } from "@/http/controllers/archetypes/getArchetypeWithHeaderController.js";
import { saveDraftController } from "@/http/controllers/archetypes/saveDraftController.js";
import { deleteDraftController } from "@/http/controllers/archetypes/deleteDraftController.js";

const router = Router();

/** Registers or updates a guide and mark the archetype as registered */
router.post(
  "/:id/register",
  requireAuth,
  registerGuideMiddleware,
  registerGuideController,
);

/** Save or update a draft guide (max 3 per user) */
router.post(
  "/:id/draft",
  requireAuth,
  saveDraftController,
);

/** Delete a draft guide */
router.delete(
  "/draft/:draftId",
  requireAuth,
  deleteDraftController,
);

/** Get archetype guide with its header card to display as list */
router.get(
  "/:id/with-header",
  getArchetypeWithHeaderController,
);

export default router;
