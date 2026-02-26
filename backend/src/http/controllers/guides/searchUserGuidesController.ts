import { Request, Response } from "express";
import { ArchetypeInstanceServicePort } from "@/application/ports/ArchetypeInstanceService";
import { validateStringParam } from "@/shared/utils/paramValidation";

/** Search guide instances for a user by title */
export const createSearchUserGuidesController =
  (instanceService: ArchetypeInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const title = req.query.title as string | undefined;
      const sortBy = req.query.sortBy as "likes" | "updated" | undefined;

      const userIdString = validateStringParam(userId);

      if (!userIdString) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      if (!title || title.trim().length === 0) {
        res.status(400).json({ error: "Search title is required" });
        return;
      }

      if (sortBy && sortBy !== "likes" && sortBy !== "updated") {
        res.status(400).json({
          error: "Invalid sortBy parameter. Must be 'likes' or 'updated'",
        });
        return;
      }

      const instances = await instanceService.searchInstancesByUserIdAndTitle(
        userIdString,
        title,
        sortBy || "updated",
      );

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error searching user instances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
