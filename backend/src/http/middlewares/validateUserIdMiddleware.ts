import { Request, Response, NextFunction } from "express";

export const validateUserIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userIdParam = req.params.userId;

  if (!userIdParam || Array.isArray(userIdParam)) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
    return;
  }

  next();
};
