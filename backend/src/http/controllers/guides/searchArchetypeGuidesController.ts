import { Request, Response } from "express";
import { GuideInstanceServicePort } from "@/application/ports/GuideApplicationPort.js";

/** Search guide instances for an archetype by title */
export const createSearchArchetypeGuidesController =
  (instanceService: GuideInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const archetypeId = typeof id === 'string' ? parseInt(id) : NaN;
      const title = req.query.title as string | undefined;
      const sortBy = req.query.sortBy as 'likes' | 'updated' | undefined;

      if (isNaN(archetypeId)) {
        res.status(400).json({ error: "Invalid archetype ID" });
        return;
      }

      if (!title || title.trim().length === 0) {
        res.status(400).json({ error: "Search title is required" });
        return;
      }

      if (sortBy && sortBy !== 'likes' && sortBy !== 'updated') {
        res.status(400).json({ error: "Invalid sortBy parameter. Must be 'likes' or 'updated'" });
        return;
      }

      const instances = await instanceService.searchGuideItemList(
        archetypeId,
        title,
        sortBy || 'updated'
      );

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error searching archetype instances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
