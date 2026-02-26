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
