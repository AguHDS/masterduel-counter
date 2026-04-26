import { Request, Response } from "express";
import { GuideInstanceServicePort } from "@/application/ports/GuideApplicationPort.js";

/** Get all guide instances for an archetype created by all users */
export const createGetArchetypeGuidesController =
  (instanceService: GuideInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const archetypeId = typeof id === 'string' ? parseInt(id) : NaN;
      const sortBy = req.query.sortBy as 'likes' | 'updated' | 'views' | undefined;
      const type = req.query.type as string | undefined;

      if (isNaN(archetypeId)) {
        res.status(400).json({ error: "Invalid archetype ID" });
        return;
      }

      if (sortBy && sortBy !== 'likes' && sortBy !== 'updated' && sortBy !== 'views') {
        res.status(400).json({ error: "Invalid sortBy parameter. Must be 'likes', 'updated' or 'views'" });
        return;
      }

      // Validate type parameter if provided
      if (type && type !== 'counter' && type !== 'deck') {
        res.status(400).json({ error: "Invalid type parameter. Must be 'counter' or 'deck'" });
        return;
      }

      const guideType = type ? (type === 'counter' ? 'COUNTER' : 'DECK') : undefined;

      const instances = await instanceService.getGuidesByArchetypeId(
        archetypeId,
        sortBy || 'updated',
        guideType,
      );

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching archetype instances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
