import { Router } from "express";
import { selectCardController } from "@/http/controllers/cards/selectCardController.js";
import { selectCardMiddleware } from "@/http/middlewares/cards/selectCardMiddleware.js";

const router = Router();

router.post("/", selectCardMiddleware, selectCardController);

export default router;
