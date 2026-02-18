import { Router } from "express";
import { createGetCardDetailsController } from "@/http/controllers/cards/getCardDetailsController";
import { compositionRoot } from "@/compositionRoot";

const router = Router();

const getCardDetailsController = createGetCardDetailsController(
  compositionRoot.getCardDetailsService
);

router.get("/:cardId", getCardDetailsController);

export default router;
