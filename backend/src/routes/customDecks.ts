import { Router } from "express";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import { validateCreateCustomDeck } from "@/http/middlewares/customDecks/createCustomDeckMiddleware.js";
import { validateUpdateCustomDeck } from "@/http/middlewares/customDecks/updateCustomDeckMiddleware.js";
import { validateReorderCustomDecks } from "@/http/middlewares/customDecks/reorderCustomDecksMiddleware.js";
import { createCustomDeckController } from "@/http/controllers/customDecks/createCustomDeckController.js";
import { getCustomDecksController } from "@/http/controllers/customDecks/getCustomDecksController.js";
import { getCustomDeckController } from "@/http/controllers/customDecks/getCustomDeckController.js";
import { updateCustomDeckController } from "@/http/controllers/customDecks/updateCustomDeckController.js";
import { deleteCustomDeckController } from "@/http/controllers/customDecks/deleteCustomDeckController.js";
import { reorderCustomDecksController } from "@/http/controllers/customDecks/reorderCustomDecksController.js";

const router = Router();

/** Get all custom decks for a user */
router.get(
  "/users/:userId/custom-decks",
  getCustomDecksController,
);

/** Get a specific custom deck */
router.get(
  "/users/:userId/custom-decks/:deckId",
  requireAuth,
  getCustomDeckController,
);

/** Create a new custom deck for user profiles */
router.post(
  "/users/:userId/custom-decks",
  requireAuth,
  validateCreateCustomDeck,
  createCustomDeckController,
);

/** Update a custom deck */
router.put(
  "/users/:userId/custom-decks/:deckId",
  requireAuth,
  validateUpdateCustomDeck,
  updateCustomDeckController,
);

/** Reorder custom decks */
router.put(
  "/users/:userId/custom-decks-reorder",
  requireAuth,
  validateReorderCustomDecks,
  reorderCustomDecksController,
);

/** Delete a custom deck */
router.delete(
  "/users/:userId/custom-decks/:deckId",
  requireAuth,
  deleteCustomDeckController,
);

export default router;
