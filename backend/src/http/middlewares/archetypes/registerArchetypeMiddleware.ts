import { Request, Response, NextFunction } from "express";

export const registerArchetypeMiddleware = (
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
  const { cardPairs, headerCardId } = req.body;

  // Validate that the archetype ID is valid
  if (!archetypeId || isNaN(archetypeId) || archetypeId <= 0) {
    res.status(400).json({
      success: false,
      error: "Invalid archetype ID",
    });
    return;
  }

  // Validate that cardPairs is present and is an array
  if (!cardPairs || !Array.isArray(cardPairs)) {
    res.status(400).json({
      success: false,
      error: "cardPairs must be an array",
    });
    return;
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
    for (const cardId of pair.topCardIds) {
      if (typeof cardId !== "number" || cardId <= 0) {
        res.status(400).json({
          success: false,
          error: `Invalid card ID in topCardIds at pair index ${i}`,
        });
        return;
      }
    }

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

  next();
};
