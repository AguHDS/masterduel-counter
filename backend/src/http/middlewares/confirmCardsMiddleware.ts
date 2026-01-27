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

  if (cardIds.length === 0) {
    res.status(400).json({ 
      error: "Validation error",
      message: "cardIds array must contain at least one element" 
    });
    return;
  }

  if (cardIds.length > 50) {
    res.status(400).json({ 
      error: "Validation error",
      message: "cardIds array must not exceed 50 elements" 
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
