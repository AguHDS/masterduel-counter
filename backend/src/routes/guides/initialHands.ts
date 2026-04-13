import express from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetInitialHandsController } from "@/http/controllers/guides/getInitialHandsController.js";

const router = express.Router();
const initialHandService = getDependencies().getInitialHandService();
const getInitialHandsController = createGetInitialHandsController(
  initialHandService,
);

router.get(
  "/:instanceId/initial-hands",
  getInitialHandsController,
);

export default router;
