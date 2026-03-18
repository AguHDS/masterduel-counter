import { Request, Response } from "express";
import { ArchetypeInstanceServicePort } from "@/application/ports/ArchetypeInstanceService.js";

/** Get all guide instances for an archetype created by all users */
export const createGetArchetypeGuidesController =
  (instanceService: ArchetypeInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const archetypeId = typeof id === 'string' ? parseInt(id) : NaN;
      const sortBy = req.query.sortBy as 'likes' | 'updated' | undefined;

      if (isNaN(archetypeId)) {
        res.status(400).json({ error: "Invalid archetype ID" });
        return;
      }

      if (sortBy && sortBy !== 'likes' && sortBy !== 'updated') {
        res.status(400).json({ error: "Invalid sortBy parameter. Must be 'likes' or 'updated'" });
        return;
      }

      const instances = await instanceService.getGuidesByArchetypeId(
        archetypeId,
        sortBy || 'updated'
      );

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching archetype instances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
