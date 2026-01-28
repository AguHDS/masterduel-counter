import { Request, Response } from "express";
import { ArchetypeInstanceServicePort } from "@/application/ports/ArchetypeInstanceService";

/** Obtiene todas las instancias creadas para un arquetipo específico (de todos los usuarios) */
export const createGetArchetypeInstancesController =
  (instanceService: ArchetypeInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const archetypeId = typeof id === 'string' ? parseInt(id) : NaN;

      if (isNaN(archetypeId)) {
        res.status(400).json({ error: "Invalid archetype ID" });
        return;
      }

      const instances = await instanceService.getInstancesByArchetypeId(archetypeId);

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching archetype instances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
