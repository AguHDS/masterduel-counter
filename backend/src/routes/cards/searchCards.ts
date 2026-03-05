import { Router } from "express";
import { searchCardsController } from "@/http/controllers/cards/searchCardsController.js";
import { searchCardsMiddleware } from "@/http/middlewares/cards/searchCardsMiddleware.js";

const router = Router();

router.get("/", searchCardsMiddleware, searchCardsController);

export default router;
