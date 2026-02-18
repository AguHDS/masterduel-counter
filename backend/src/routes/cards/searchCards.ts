import { Router } from "express";
import { searchCardsController } from "@/http/controllers/cards/searchCardsController";
import { searchCardsMiddleware } from "@/http/middlewares/cards/searchCardsMiddleware";

const router = Router();

router.get("/", searchCardsMiddleware, searchCardsController);

export default router;
