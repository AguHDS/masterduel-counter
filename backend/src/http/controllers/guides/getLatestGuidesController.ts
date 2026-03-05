import { Request, Response } from "express";
import { ArchetypeInstanceServicePort } from "@/application/ports/ArchetypeInstanceService.js";

/** Get the latest created guide instances across all archetypes */
export const createGetLatestGuidesController =
  (instanceService: ArchetypeInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam) : 5;

      if (isNaN(limit) || limit < 1 || limit > 50) {
        res.status(400).json({ error: "Invalid limit parameter. Must be between 1 and 50" });
        return;
      }

      const instances = await instanceService.getLatestCreatedInstances(limit);

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching latest guides:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
