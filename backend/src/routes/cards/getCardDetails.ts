import { Router } from "express";
import { createGetCardDetailsController } from "@/http/controllers/cards/getCardDetailsController.js";
import { getDependencies } from "@/compositionRoot.js";

const router = Router();
const getCardDetailsService = getDependencies().getGetCardDetailsService();
const getCardDetailsController = createGetCardDetailsController(getCardDetailsService);

router.get("/:cardId", getCardDetailsController);

export default router;
