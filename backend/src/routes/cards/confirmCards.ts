import { Router } from "express";
import { confirmCardsController } from "@/http/controllers/confirmCardsController";
import { confirmCardsMiddleware } from "@/http/middlewares/cards/confirmCardsMiddleware";

const router = Router();

router.post("/", confirmCardsMiddleware, confirmCardsController);

export default router;
