import { Request, Response, NextFunction } from "express";

export const selectCardMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { cardId } = req.body;

  if (cardId === undefined || cardId === null) {
    res.status(400).json({ 
      error: "Validation error",
      message: "cardId is required" 
    });
    return;
  }

  if (typeof cardId !== "number" || !Number.isInteger(cardId)) {
    res.status(400).json({ 
      error: "Validation error",
      message: "cardId must be an integer" 
    });
    return;
  }

  if (cardId <= 0) {
    res.status(400).json({ 
      error: "Validation error",
      message: "cardId must be a positive number" 
    });
    return;
  }

  next();
};
