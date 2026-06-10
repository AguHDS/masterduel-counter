import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetUserGuidesController } from "@/http/controllers/profile/getUserGuidesController.js";
import { optionalAuthMiddleware } from "@/http/middlewares/auth/optionalAuthMiddleware.js";

const router = Router();
const profileService = getDependencies().getProfileService();
const getUserGuidesController = createGetUserGuidesController(profileService);

/** Get user guides (for user profile) */
router.get("/users/:userId/instances", optionalAuthMiddleware, getUserGuidesController);

export default router;
