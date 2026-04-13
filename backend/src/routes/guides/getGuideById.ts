import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { createGetGuideByIdController } from "@/http/controllers/guides/getGuideByIdController.js";

/** Get a guide created by a user by ID to view. */
const router = Router();
const dependencies = getDependencies();
const getGuideByIdController = createGetGuideByIdController(
  dependencies.getInstanceRepository(),
  dependencies.getCardPairRepository(),
  dependencies.getCardRepository(),
  dependencies.getArchetypeRepository(),
  dependencies.getUserRepository(),
  dependencies.getInitialHandRepository(),
  dependencies.getComboStepRepository(),
);

router.get("/instances/:instanceId", getGuideByIdController);

export default router;
