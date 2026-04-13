import { Request, Response } from "express";
import { GuideInstanceServicePort } from "@/application/ports/GuideApplicationPort.js";

/** Get all guide instances across all archetypes, optionally filtered by type and searched by title/archetype */
export const createGetAllGuidesController =
  (instanceService: GuideInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const sortBy = req.query.sortBy as "likes" | "updated" | undefined;
      const type = req.query.type as string | undefined;
      const search = req.query.search as string | undefined;

      if (sortBy && sortBy !== "likes" && sortBy !== "updated") {
        res.status(400).json({ error: "Invalid sortBy parameter. Must be 'likes' or 'updated'" });
        return;
      }

      if (type && type !== "counter" && type !== "deck") {
        res.status(400).json({ error: "Invalid type parameter. Must be 'counter' or 'deck'" });
        return;
      }

      const guideType = type ? (type === "counter" ? "COUNTER" : "DECK") : undefined;
      const guides = await instanceService.getAllGuides(sortBy ?? "updated", guideType, search);

      res.status(200).json(guides);
    } catch (error) {
      console.error("Error fetching all guides:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
