import { Request, Response } from "express";
import { ArchetypeApplicationPort } from "@/application/ports/ArchetypeApplicationPort.js";

export const createGetGeneralStatsController = (
  archetypeService: ArchetypeApplicationPort
) => {
  return async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 15;

      if (isNaN(limit) || limit < 1 || limit > 50) {
        return res.status(400).json({
          error: "Invalid limit parameter. Must be between 1 and 50.",
        });
      }

      const stats = await archetypeService.getGuidesGeneralStats(limit);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching general stats:", error);
      return res.status(500).json({
        error: "Failed to fetch general statistics",
      });
    }
  };
};
