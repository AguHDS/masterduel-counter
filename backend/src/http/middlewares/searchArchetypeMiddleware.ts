import { Request, Response, NextFunction } from "express";

export const searchArchetypeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, limit } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Parameter 'name' is required",
        message: "You must provide an archetype name to search",
      });
    }

    if (typeof name !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid parameter format",
        message: "The 'name' parameter must be a string",
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Empty name",
        message: "The archetype name cannot be empty",
      });
    }

    if (trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Name too long",
        message: "The archetype name cannot exceed 100 characters",
      });
    }

    if (limit) {
      if (typeof limit !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid limit parameter",
          message: "Limit must be a string representing a number",
        });
      }

      const limitNumber = parseInt(limit);
      if (isNaN(limitNumber) || limitNumber <= 0 || limitNumber > 100) {
        return res.status(400).json({
          success: false,
          error: "Invalid limit value",
          message: "Limit must be a number between 1 and 100",
        });
      }
    }

    // Sanitize the name (remove extra spaces)
    const sanitizedName = trimmedName.replace(/\s+/g, " ");

    req.query.name = sanitizedName;
    if (limit) {
      req.query.limit = limit;
    }

    next();
  } catch (error) {
    console.error("[Search Archetype Middleware Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An error occurred while processing your search",
    });
  }
};
