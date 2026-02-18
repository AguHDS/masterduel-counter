import { Router } from "express";
import { requireAuth } from "@/http/middlewares/authMiddleware";
import { validateCreateOrUpdateRecommendedDeck } from "@/http/middlewares/guides/createOrUpdateRecommendedDeckMiddleware";
import { validateGetRecommendedDeck } from "@/http/middlewares/guides/getRecommendedDeckMiddleware";
import { validateDeleteRecommendedDeck } from "@/http/middlewares/guides/deleteRecommendedDeckMiddleware";
import { createOrUpdateRecommendedDeckController } from "@/http/controllers/guides/createOrUpdateRecommendedDeckController";
import { getRecommendedDeckController } from "@/http/controllers/guides/getRecommendedDeckController";
import { deleteRecommendedDeckController } from "@/http/controllers/guides/deleteRecommendedDeckController";

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

export default router;
