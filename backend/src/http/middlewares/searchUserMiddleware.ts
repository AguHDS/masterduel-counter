import { Request, Response, NextFunction } from "express";

export const searchUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { q, limit } = req.query;

  if (q === undefined || q === null) {
    res.status(400).json({
      success: false,
      error: "Search query parameter 'q' is required",
    });
    return;
  }

  if (Array.isArray(q)) {
    res.status(400).json({
      success: false,
      error: "Search query must be a single value",
    });
    return;
  }

  if (typeof q !== "string") {
    res.status(400).json({
      success: false,
      error: "Search query must be a string",
    });
    return;
  }

  const trimmedQuery = q.trim();
  if (trimmedQuery.length === 0) {
    res.status(400).json({
      success: false,
      error: "Search query cannot be empty",
    });
    return;
  }

  if (limit !== undefined) {
    if (Array.isArray(limit)) {
      res.status(400).json({
        success: false,
        error: "Limit must be a single value",
      });
      return;
    }

    const limitNumber = parseInt(limit as string, 10);
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res.status(400).json({
        success: false,
        error: "Limit must be a number between 1 and 100",
      });
      return;
    }
  }

  req.query.q = trimmedQuery;

  next();
};
