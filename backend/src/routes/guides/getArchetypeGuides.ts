import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetArchetypeGuidesController } from "@/http/controllers/guides/getArchetypeGuidesController.js";

const router = Router();
const instanceService = getDependencies().getInstanceService();
const getArchetypeGuidesController = createGetArchetypeGuidesController(
  instanceService,
);

/** Get all guide instances for an archetype created by all users */
router.get("/archetypes/:id/instances", getArchetypeGuidesController);

export default router;
