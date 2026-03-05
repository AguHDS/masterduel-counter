import { Router } from "express";
import { createGetCardDetailsController } from "@/http/controllers/cards/getCardDetailsController.js";
import { compositionRoot } from "@/compositionRoot.js";

const router = Router();

const getCardDetailsController = createGetCardDetailsController(
  compositionRoot.getCardDetailsService
);

router.get("/:cardId", getCardDetailsController);

export default router;
