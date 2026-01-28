import { Request, Response } from "express";
import { ArchetypeInstanceServicePort } from "@/application/ports/ArchetypeInstanceService";

/** Obtiene todas las instancias de arquetipos creadas por un usuario específico */
export const createGetUserInstancesController =
  (instanceService: ArchetypeInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

      if (typeof userId !== 'string') {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const instances = await instanceService.getInstancesByUserId(userId);

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching user instances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
