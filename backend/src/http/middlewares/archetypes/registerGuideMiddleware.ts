import { Request, Response, NextFunction } from "express";

export const registerGuideMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const id = req.params.id;
  if (typeof id !== "string") {
    res.status(400).json({ success: false, error: "Invalid archetype ID" });
    return;
  }
  const archetypeId = parseInt(id);
  const { guideType, cardPairs, initialHands, headerCardId } = req.body;

  // Validate that the archetype ID is valid
  if (!archetypeId || isNaN(archetypeId) || archetypeId <= 0) {
    res.status(400).json({
      success: false,
      error: "Invalid archetype ID",
    });
    return;
  }

  // Validate guideType
  if (!guideType || (guideType !== "COUNTER" && guideType !== "DECK")) {
    res.status(400).json({
      success: false,
      error: "guideType must be either 'COUNTER' or 'DECK'",
    });
    return;
  }

  // Validate according to guide type
  if (guideType === "COUNTER") {
    // For Counter Guides, cardPairs must be present and is an array
    if (!cardPairs || !Array.isArray(cardPairs)) {
      res.status(400).json({
        success: false,
        error: "cardPairs must be an array for Counter Guides",
      });
      return;
    }

    // If there are pairs, validate the structure of each pair
    for (let i = 0; i < cardPairs.length; i++) {
      const pair = cardPairs[i];

      // At least one card in top or bottom
      if (
        (!pair.topCardIds ||
          !Array.isArray(pair.topCardIds) ||
          pair.topCardIds.length === 0) &&
        (!pair.bottomCardIds ||
          !Array.isArray(pair.bottomCardIds) ||
          pair.bottomCardIds.length === 0)
      ) {
        res.status(400).json({
          success: false,
          error: `Each pair must have at least one card in top or bottom at index ${i}`,
        });
        return;
      }

      // Validate each card ID is a valid number
      if (pair.topCardIds) {
        for (const cardId of pair.topCardIds) {
          if (typeof cardId !== "number" || cardId <= 0) {
            res.status(400).json({
              success: false,
              error: `Invalid card ID in topCardIds at pair index ${i}`,
            });
            return;
          }
        }
      }

      if (pair.bottomCardIds) {
        for (const cardId of pair.bottomCardIds) {
          if (typeof cardId !== "number" || cardId <= 0) {
            res.status(400).json({
              success: false,
              error: `Invalid card ID in bottomCardIds at pair index ${i}`,
            });
            return;
          }
        }
      }
    }
  } else if (guideType === "DECK") {
    // For Deck Guides, initialHands must be present and is an array
    if (!initialHands || !Array.isArray(initialHands)) {
      res.status(400).json({
        success: false,
        error: "initialHands must be an array for Deck Guides",
      });
      return;
    }

    // Validate the structure of each initial hand
    for (let i = 0; i < initialHands.length; i++) {
      const hand = initialHands[i];

      // Must have cardIds array
      if (!hand.cardIds || !Array.isArray(hand.cardIds) || hand.cardIds.length === 0) {
        res.status(400).json({
          success: false,
          error: `Each initial hand must have at least one card at index ${i}`,
        });
        return;
      }

      // Validate each card ID is a valid number
      for (const cardId of hand.cardIds) {
        if (typeof cardId !== "number" || cardId <= 0) {
          res.status(400).json({
            success: false,
            error: `Invalid card ID in initialHands at index ${i}`,
          });
          return;
        }
      }
    }
  }

  // Validate headerCardId if it is present
  if (
    headerCardId !== undefined &&
    (typeof headerCardId !== "number" || headerCardId <= 0)
  ) {
    res.status(400).json({
      success: false,
      error: "headerCardId must be a valid positive number",
    });
    return;
  }

  next();
};
