import { Request, Response, NextFunction } from "express";

export const validateFavoriteCardAndDecksMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { favoriteCardId, favoriteDecks } = req.body;

  // Validate favoriteCardId if provided
  if (favoriteCardId !== undefined && favoriteCardId !== null) {
    if (typeof favoriteCardId !== "number" || favoriteCardId < 0) {
      return res.status(400).json({
        success: false,
        message: "favoriteCardId must be a positive number or null",
      });
    }
  }

  // Validate favoriteDecks JSON if provided
  if (favoriteDecks !== undefined && favoriteDecks !== null) {
    if (typeof favoriteDecks !== "string") {
      return res.status(400).json({
        success: false,
        message: "favoriteDecks must be a valid JSON string or null",
      });
    }

    // Try to parse JSON if not null and not empty
    if (favoriteDecks.trim() !== "") {
      try {
        const parsed = JSON.parse(favoriteDecks);
        if (!Array.isArray(parsed)) {
          return res.status(400).json({
            success: false,
            message: "favoriteDecks must be a JSON array",
          });
        }

        // Validate structure of each non-null deck entry
        for (const deck of parsed) {
          // Skip null entries (they represent empty slots)
          if (deck === null || deck === undefined) {
            continue;
          }
          
          if (
            typeof deck !== "object" ||
            typeof deck.archetypeId !== "number" ||
            typeof deck.archetypeName !== "string" ||
            typeof deck.cardId !== "number"
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Each deck must have archetypeId (number), archetypeName (string), and cardId (number)",
            });
          }
        }
      } catch {
        return res.status(400).json({
          success: false,
          message: "favoriteDecks contains invalid JSON",
        });
      }
    }
  }

  next();
};
