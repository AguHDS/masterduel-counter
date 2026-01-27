import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

export const getArchetypeWithHeaderController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    if (typeof id !== 'string') {
      res.status(400).json({ success: false, error: "Invalid archetype ID" });
      return;
    }
    const archetypeId = parseInt(id);

    if (isNaN(archetypeId) || archetypeId <= 0) {
      res.status(400).json({ success: false, error: "Invalid archetype ID" });
      return;
    }

    const archetypeRepository = getDependencies().getArchetypeRepository();
    const archetype = await archetypeRepository.findByIdWithHeaderCard(archetypeId);

    if (!archetype) {
      res.status(404).json({ success: false, error: "Archetype not found" });
      return;
    }

    res.status(200).json({
      success: true,
      archetype,
    });
  } catch (error) {
    console.error("Error fetching archetype with header:", error);

    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
};
