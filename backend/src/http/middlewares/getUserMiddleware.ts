import { Request, Response, NextFunction } from "express";

export const getUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).json({
      success: false,
      error: "User ID is required",
    });
    return;
  }

  if (Array.isArray(userId)) {
    res.status(400).json({
      success: false,
      error: "User ID must be a single value",
    });
    return;
  }

  if (typeof userId !== "string") {
    res.status(400).json({
      success: false,
      error: "User ID must be a string",
    });
    return;
  }

  if (userId.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: "User ID cannot be empty",
    });
    return;
  }

  next();
};
