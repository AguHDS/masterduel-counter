import { Router } from "express";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware";
import { validateCreateCustomDeck } from "@/http/middlewares/customDecks/createCustomDeckMiddleware";
import { validateUpdateCustomDeck } from "@/http/middlewares/customDecks/updateCustomDeckMiddleware";
import { createCustomDeckController } from "@/http/controllers/customDecks/createCustomDeckController";
import { getCustomDecksController } from "@/http/controllers/customDecks/getCustomDecksController";
import { getCustomDeckController } from "@/http/controllers/customDecks/getCustomDeckController";
import { updateCustomDeckController } from "@/http/controllers/customDecks/updateCustomDeckController";
import { deleteCustomDeckController } from "@/http/controllers/customDecks/deleteCustomDeckController";

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

/** Delete a custom deck */
router.delete(
  "/users/:userId/custom-decks/:deckId",
  requireAuth,
  deleteCustomDeckController,
);

export default router;
