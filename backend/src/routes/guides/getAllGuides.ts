import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetAllGuidesController } from "@/http/controllers/guides/getAllGuidesController.js";

const router = Router();
const instanceService = getDependencies().getInstanceService();
const getAllGuidesController = createGetAllGuidesController(instanceService);

/** Get all guide instances across all archetypes (optionally filtered by type, searchable by title/archetype) */
router.get("/guides", getAllGuidesController);

export default router;
