import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetLatestGuidesController } from "@/http/controllers/guides/getLatestGuidesController.js";

const router = Router();
const instanceService = getDependencies().getInstanceService();
const getLatestGuidesController = createGetLatestGuidesController(
  instanceService,
);

/** Get the latest created guide instances across all archetypes */
router.get("/guides/latest", getLatestGuidesController);

export default router;
