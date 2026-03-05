import { Request, Response } from "express";
import { ArchetypeInstanceServicePort } from "@/application/ports/ArchetypeInstanceService.js";

/** Get all archetype guides created by a specific user (for user profile)*/
export const createGetUserGuidesController =
  (instanceService: ArchetypeInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const sortBy = req.query.sortBy as 'likes' | 'updated' | undefined;

      if (typeof userId !== 'string') {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      if (sortBy && sortBy !== 'likes' && sortBy !== 'updated') {
        res.status(400).json({ error: "Invalid sortBy parameter. Must be 'likes' or 'updated'" });
        return;
      }

      const instances = await instanceService.getInstancesByUserId(
        userId,
        sortBy || 'updated'
      );

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching user instances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
