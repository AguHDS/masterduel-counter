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

    if (!pair.topCardIds || !Array.isArray(pair.topCardIds) || pair.topCardIds.length === 0) {
      res.status(400).json({
        success: false,
        error: `Invalid topCardIds in pair at index ${i}`,
      });
      return;
    }

    if (!pair.bottomCardIds || !Array.isArray(pair.bottomCardIds) || pair.bottomCardIds.length === 0) {
      res.status(400).json({
        success: false,
        error: `Invalid bottomCardIds in pair at index ${i}`,
      });
      return;
    }

    // Validate each card ID is a valid number
    for (const cardId of pair.topCardIds) {
      if (typeof cardId !== "number" || cardId <= 0) {
        res.status(400).json({
          success: false,
          error: `Invalid card ID in topCardIds at pair index ${i}`,
        });
        return;
      }
    }

    for (const cardId of pair.bottomCardIds) {
      if (typeof cardId !== "number" || cardId <= 0) {
        res.status(400).json({
          success: false,
          error: `Invalid card ID in bottomCardIds at pair index ${i}`,
        });
        return;
      }
    }
  }

  next();
};
