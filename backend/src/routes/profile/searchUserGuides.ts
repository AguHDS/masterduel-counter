import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createSearchUserGuidesController } from "@/http/controllers/profile/searchUserGuidesController.js";

const router = Router();
const profileService = getDependencies().getProfileService();
const searchUserGuidesController = createSearchUserGuidesController(
  profileService,
);

/** Search guide instances for a user by title */
router.get("/users/:userId/instances/search", searchUserGuidesController);

export default router;
