import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetUserGuidesController } from "@/http/controllers/profile/getUserGuidesController.js";

const router = Router();
const profileService = getDependencies().getProfileService();
const getUserGuidesController = createGetUserGuidesController(profileService);

/** Get user guides (for user profile) */
router.get("/users/:userId/instances", getUserGuidesController);

export default router;
