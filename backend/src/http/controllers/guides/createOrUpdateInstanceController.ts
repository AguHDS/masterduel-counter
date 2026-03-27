import { Request, Response } from "express";
import { GuideInstanceServicePort } from "@/application/ports/GuideApplicationPort.js";

/** Create or update a guide of an archetype for the authenticated user */
export const createCreateOrUpdateInstanceController =
  (instanceService: GuideInstanceServicePort) =>
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

      const { title, headerCardId, generalTip, guideType } = req.body;

      // Validate guideType
      if (guideType && guideType !== "COUNTER" && guideType !== "DECK") {
        res.status(400).json({ error: "Invalid guide type. Must be COUNTER or DECK" });
        return;
      }

      const instance = await instanceService.createOrUpdateGuide({
        archetypeId,
        userId,
        title: title || "Title",
        headerCardId: headerCardId || null,
        generalTip: generalTip || null,
        guideType: guideType || "COUNTER", // Default to COUNTER for backwards compatibility
      });

      res.status(200).json(instance);
    } catch (error) {
      console.error("Error creating/updating instance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
