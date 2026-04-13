import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetUserGuidesController } from "@/http/controllers/profile/getUserGuidesController.js";

const router = Router();
const instanceService = getDependencies().getInstanceService();
const getUserGuidesController = createGetUserGuidesController(instanceService);

/** Get user guides (for user profile) */
router.get("/users/:userId/instances", getUserGuidesController);

export default router;
