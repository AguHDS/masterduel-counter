import { Request, Response, NextFunction } from "express";

export const validateBioMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { bio } = req.body;

  if (typeof bio !== "string") {
    res.status(400).json({
      success: false,
      message: "Bio must be a string",
    });
    return;
  }

  if (bio.length > 1000) {
    res.status(400).json({
      success: false,
      message: "Bio must not exceed 1000 characters",
    });
    return;
  }

  next();
};
