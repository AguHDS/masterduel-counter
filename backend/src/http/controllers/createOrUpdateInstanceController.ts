import { Request, Response } from "express";
import { ArchetypeInstanceServicePort } from "@/application/ports/ArchetypeInstanceService";

/** Crea o actualiza una instancia de arquetipo para el usuario autenticado */
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

      const { headerCardId } = req.body;

      const instance = await instanceService.createOrUpdateInstance({
        archetypeId,
        userId,
        headerCardId: headerCardId || null,
      });

      res.status(200).json(instance);
    } catch (error) {
      console.error("Error creating/updating instance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
