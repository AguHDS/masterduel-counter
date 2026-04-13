import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createSearchArchetypeGuidesController } from "@/http/controllers/guides/searchArchetypeGuidesController.js";

const router = Router();
const instanceService = getDependencies().getInstanceService();
const searchArchetypeGuidesController = createSearchArchetypeGuidesController(
  instanceService,
);

/** Search guide instances for an archetype by title */
router.get(
  "/archetypes/:id/instances/search",
  searchArchetypeGuidesController,
);

export default router;
