import { Request, Response, NextFunction } from "express";

export const confirmCardsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { cardIds } = req.body;

  if (!Array.isArray(cardIds)) {
    res.status(400).json({ 
      error: "Validation error",
      message: "cardIds must be an array" 
    });
    return;
  }

  // Allow up to 200 unique cards:
  // - 1 header card
  // - Unlimited pairs (user can add as many as needed)
  // - 60 main deck cards (Deck limit)
  // - 15 extra deck cards (Deck limit)
  // With deduplication, actual count will be lower
  if (cardIds.length > 200) {
    res.status(400).json({ 
      error: "Validation error",
      message: "cardIds array must not exceed 200 elements" 
    });
    return;
  }

  for (const cardId of cardIds) {
    if (typeof cardId !== "number" || !Number.isInteger(cardId) || cardId <= 0) {
      res.status(400).json({ 
        error: "Validation error",
        message: "All cardIds must be positive integers" 
      });
      return;
    }
  }

  next();
};
