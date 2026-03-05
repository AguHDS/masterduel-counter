import { Router } from "express";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import { validateCreateOrUpdateRecommendedDeck } from "@/http/middlewares/guides/createOrUpdateRecommendedDeckMiddleware.js";
import { validateGetRecommendedDeck } from "@/http/middlewares/guides/getRecommendedDeckMiddleware.js";
import { validateDeleteRecommendedDeck } from "@/http/middlewares/guides/deleteRecommendedDeckMiddleware.js";
import { createOrUpdateRecommendedDeckController } from "@/http/controllers/guides/createOrUpdateRecommendedDeckController.js";
import { getRecommendedDeckController } from "@/http/controllers/guides/getRecommendedDeckController.js";
import { deleteRecommendedDeckController } from "@/http/controllers/guides/deleteRecommendedDeckController.js";

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
