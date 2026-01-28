import { Router } from "express";
import { getInstanceCardPairsController } from "@/http/controllers/getInstanceCardPairsController";

export function createGetInstanceCardPairsRoute() {
  const router = Router();

  router.get("/instances/:id/cardpairs", getInstanceCardPairsController);

  return router;
}

export default createGetInstanceCardPairsRoute();
