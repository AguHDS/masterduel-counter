import express from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetComboStepsController } from "@/http/controllers/guides/getComboStepsController.js";

const router = express.Router();
const comboStepService = getDependencies().getComboStepService();
const getComboStepsController = createGetComboStepsController(comboStepService);

router.get(
  "/:initialHandId/combo-steps",
  getComboStepsController,
);

export default router;
