import { Router } from "express";
import { getGuideCardPairsController } from "@/http/controllers/guides/getGuideCardPairsController.js";

const router = Router();

router.get("/instances/:id/cardpairs", getGuideCardPairsController);

export default router;
