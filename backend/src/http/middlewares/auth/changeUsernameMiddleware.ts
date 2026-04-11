import { Request, Response, NextFunction } from "express";
import { matchedData, validationResult } from "express-validator";

export const changeUsernameMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => e.msg);

    res.status(400).json({
      message: errorMessages[0] || "Validation error",
      errors: errorMessages,
    });
    return;
  }

  const { username } = matchedData(req) as { username: string };
  res.locals.changeUsernameData = { username };

  next();
};