import { Request, Response, NextFunction } from "express";

export const validateCreateGuideRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { title, description, archetypeId, guideType } = req.body as {
    title?: unknown;
    description?: unknown;
    archetypeId?: unknown;
    guideType?: unknown;
  };

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "title is required." });
    return;
  }

  if (title.trim().length > 100) {
    res.status(400).json({ error: "title must be 100 characters or less." });
    return;
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      res.status(400).json({ error: "description must be a string." });
      return;
    }
    if (description.length > 500) {
      res.status(400).json({ error: "description must be 500 characters or less." });
      return;
    }
  }

  const parsedArchetypeId = Number(archetypeId);
  if (!archetypeId || isNaN(parsedArchetypeId) || parsedArchetypeId <= 0 || !Number.isInteger(parsedArchetypeId)) {
    res.status(400).json({ error: "archetypeId must be a positive integer." });
    return;
  }

  if (!guideType || (guideType !== "COUNTER" && guideType !== "DECK")) {
    res.status(400).json({ error: "guideType must be COUNTER or DECK." });
    return;
  }

  next();
};
