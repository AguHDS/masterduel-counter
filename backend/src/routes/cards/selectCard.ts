import { Router } from "express";
import { selectCardController } from "@/http/controllers/cards/selectCardController";
import { selectCardMiddleware } from "@/http/middlewares/cards/selectCardMiddleware";

const router = Router();

router.post("/", selectCardMiddleware, selectCardController);

export default router;
