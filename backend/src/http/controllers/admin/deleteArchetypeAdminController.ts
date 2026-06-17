import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Delete archetype from our system - Admin Pannel */
export const deleteArchetypeAdminController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid archetype ID" });
      return;
    }

    const archetypeService = getDependencies().getArchetypeService();
    const deleted = await archetypeService.deleteArchetype(id);

    if (!deleted) {
      res.status(400).json({ success: false, message: "Cannot delete archetype. It may have guides associated." });
      return;
    }

    res.status(200).json({ success: true, message: "Archetype deleted" });
  } catch (error) {
    console.error("Error deleting archetype:", error);
    res.status(500).json({ success: false, message: "Failed to delete archetype" });
  }
};
