import { Request, Response, NextFunction } from "express";

export const searchCardsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    res.status(400).json({ 
      error: "Validation error",
      message: "Query parameter is required and must be a string" 
    });
    return;
  }

  if (query.trim().length === 0) {
    res.status(400).json({ 
      error: "Validation error",
      message: "Query parameter cannot be empty" 
    });
    return;
  }

  if (query.length > 100) {
    res.status(400).json({ 
      error: "Validation error",
      message: "Query parameter must not exceed 100 characters" 
    });
    return;
  }

  next();
};
