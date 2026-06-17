import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Update name of existing archetype */
export const updateArchetypeAdminController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid archetype ID" });
      return;
    }

    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ success: false, message: "Archetype name is required" });
      return;
    }

    const deps = getDependencies();
    const archetypeService = deps.getArchetypeService();
    const archetype = await archetypeService.updateArchetype(id, name.trim());

    if (!archetype) {
      res.status(409).json({ success: false, message: "Name already exists or archetype not found" });
      return;
    }

    // Cascade: update tier_list_entries.linked_archetype_name
    await deps.getTierListRepository().updateLinkedArchetypeName(id, name.trim());

    res.status(200).json({ success: true, archetype });
  } catch (error) {
    console.error("Error updating archetype:", error);
    res.status(500).json({ success: false, message: "Failed to update archetype" });
  }
};
