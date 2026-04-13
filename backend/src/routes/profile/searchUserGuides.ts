import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createSearchUserGuidesController } from "@/http/controllers/guides/searchUserGuidesController.js";

const router = Router();
const instanceService = getDependencies().getInstanceService();
const searchUserGuidesController = createSearchUserGuidesController(
  instanceService,
);

/** Search guide instances for a user by title */
router.get("/users/:userId/instances/search", searchUserGuidesController);

export default router;
