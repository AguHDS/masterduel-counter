import express from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetInitialHandsController } from "@/http/controllers/guides/getInitialHandsController.js";

const router = express.Router();

const deps = getDependencies();
const initialHandService = deps.getInitialHandService();

router.get(
  "/:instanceId/initial-hands",
  createGetInitialHandsController(initialHandService),
);

export default router;
