import express from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetComboStepsController } from "@/http/controllers/guides/getComboStepsController.js";

const router = express.Router();

const deps = getDependencies();
const comboStepService = deps.getComboStepService();

router.get(
  "/:initialHandId/combo-steps",
  createGetComboStepsController(comboStepService),
);

export default router;
