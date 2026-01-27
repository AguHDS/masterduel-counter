import { Router } from "express";
import { selectCardController } from "@/http/controllers/selectCardController";
import { selectCardMiddleware } from "@/http/middlewares/selectCardMiddleware";

const router = Router();

router.post("/", selectCardMiddleware, selectCardController);

export default router;
