import { Router } from "express";
import { confirmCardsController } from "@/http/controllers/cards/confirmCardsController.js";
import { confirmCardsMiddleware } from "@/http/middlewares/cards/confirmCardsMiddleware.js";

const router = Router();

router.post("/", confirmCardsMiddleware, confirmCardsController);

export default router;
