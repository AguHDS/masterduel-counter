import { Router } from "express";
import { getInstanceCardPairsController } from "@/http/controllers/getInstanceCardPairsController";

const router = Router();

router.get("/instances/:id/cardpairs", getInstanceCardPairsController);

export default router;
