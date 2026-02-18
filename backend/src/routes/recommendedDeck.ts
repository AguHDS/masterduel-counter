import { Router } from "express";
import { requireAuth } from "../http/middlewares/authMiddleware";
import { validateCreateOrUpdateRecommendedDeck } from "../http/middlewares/recommended-deck/createOrUpdateRecommendedDeckMiddleware";
import { validateGetRecommendedDeck } from "../http/middlewares/recommended-deck/getRecommendedDeckMiddleware";
import { validateDeleteRecommendedDeck } from "../http/middlewares/recommended-deck/deleteRecommendedDeckMiddleware";
import { createOrUpdateRecommendedDeckController } from "../http/controllers/recommended-deck/createOrUpdateRecommendedDeckController";
import { getRecommendedDeckController } from "../http/controllers/recommended-deck/getRecommendedDeckController";
import { deleteRecommendedDeckController } from "../http/controllers/recommended-deck/deleteRecommendedDeckController";

export function createRecommendedDeckRoutes() {
  const router = Router();

  /** Create or update recommended deck for an instance */
  router.post(
    "/instances/:instanceId/recommended-deck",
    requireAuth,
    validateCreateOrUpdateRecommendedDeck,
    createOrUpdateRecommendedDeckController,
  );

  /** Get recommended deck for an instance */
  router.get(
    "/instances/:instanceId/recommended-deck",
    validateGetRecommendedDeck,
    getRecommendedDeckController,
  );

  /** Delete recommended deck */
  router.delete(
    "/instances/:instanceId/recommended-deck",
    requireAuth,
    validateDeleteRecommendedDeck,
    deleteRecommendedDeckController,
  );

  return router;
}

export default createRecommendedDeckRoutes();
