import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Create a new archetype on our system - For admin pannel */
export const createArchetypeAdminController = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ success: false, message: "Archetype name is required" });
      return;
    }

    const archetypeService = getDependencies().getArchetypeService();
    const archetype = await archetypeService.createArchetype(name.trim());

    if (!archetype) {
      res.status(409).json({ success: false, message: "Archetype already exists" });
      return;
    }

    res.status(201).json({ success: true, archetype });
  } catch (error) {
    console.error("Error creating archetype:", error);
    res.status(500).json({ success: false, message: "Failed to create archetype" });
  }
};
