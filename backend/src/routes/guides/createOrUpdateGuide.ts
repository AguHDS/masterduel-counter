import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createCreateOrUpdateInstanceController } from "@/http/controllers/guides/createOrUpdateInstanceController.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";

const router = Router();
const instanceService = getDependencies().getInstanceService();
const createOrUpdateInstanceController = createCreateOrUpdateInstanceController(
  instanceService,
);

/** Create or update a guide for the authenticated user */
router.post(
  "/archetypes/:id/instances",
  requireAuth,
  createOrUpdateInstanceController,
);

export default router;
