import { Request, Response } from "express";
import { ArchetypeInstanceServicePort } from "@/application/ports/ArchetypeInstanceService";

/** Create or update an archetype instance for the authenticated user */
export const createCreateOrUpdateInstanceController =
  (instanceService: ArchetypeInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const archetypeId = typeof id === 'string' ? parseInt(id) : NaN;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(archetypeId)) {
        res.status(400).json({ error: "Invalid archetype ID" });
        return;
      }

      const { title, headerCardId, generalTip } = req.body;

      const instance = await instanceService.createOrUpdateInstance({
        archetypeId,
        userId,
        title: title || "Title",
        headerCardId: headerCardId || null,
        generalTip: generalTip || null,
      });

      res.status(200).json(instance);
    } catch (error) {
      console.error("Error creating/updating instance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
