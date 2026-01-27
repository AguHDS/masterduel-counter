import { Request, Response, NextFunction } from "express";

export const registerArchetypeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    res.status(400).json({ success: false, error: "Invalid archetype ID" });
    return;
  }
  const archetypeId = parseInt(id);
  const { cardPairs, headerCardId } = req.body;

  // Validar que el ID del arquetipo sea válido
  if (!archetypeId || isNaN(archetypeId) || archetypeId <= 0) {
    res.status(400).json({
      success: false,
      error: "Invalid archetype ID",
    });
    return;
  }

  // Validar que cardPairs esté presente y sea un array
  if (!cardPairs || !Array.isArray(cardPairs)) {
    res.status(400).json({
      success: false,
      error: "cardPairs must be an array",
    });
    return;
  }

  // Validar headerCardId si está presente
  if (headerCardId !== undefined && (typeof headerCardId !== "number" || headerCardId <= 0)) {
    res.status(400).json({
      success: false,
      error: "headerCardId must be a valid positive number",
    });
    return;
  }

  // Si hay pares, validar la estructura de cada par
  for (let i = 0; i < cardPairs.length; i++) {
    const pair = cardPairs[i];

    if (!pair.topCardId || typeof pair.topCardId !== "number") {
      res.status(400).json({
        success: false,
        error: `Invalid topCardId in pair at index ${i}`,
      });
      return;
    }

    if (!pair.bottomCardId || typeof pair.bottomCardId !== "number") {
      res.status(400).json({
        success: false,
        error: `Invalid bottomCardId in pair at index ${i}`,
      });
      return;
    }
  }

  next();
};
