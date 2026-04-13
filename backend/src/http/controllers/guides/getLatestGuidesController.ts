import { Request, Response } from "express";
import { GuideInstanceServicePort } from "@/application/ports/GuideApplicationPort.js";

/** Get the latest created guide instances across all archetypes */
export const createGetLatestGuidesController =
  (instanceService: GuideInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam) : 5;
      const type = req.query.type as string | undefined;

      if (isNaN(limit) || limit < 1 || limit > 50) {
        res.status(400).json({ error: "Invalid limit parameter. Must be between 1 and 50" });
        return;
      }

      // Validate type parameter if provided
      if (type && type !== 'counter' && type !== 'deck') {
        res.status(400).json({ error: "Invalid type parameter. Must be 'counter' or 'deck'" });
        return;
      }

      const guideType = type ? (type === 'counter' ? 'COUNTER' : 'DECK') : undefined;

      const instances = await instanceService.getLastedCreatedGuides(limit, guideType);

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching latest guides:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
