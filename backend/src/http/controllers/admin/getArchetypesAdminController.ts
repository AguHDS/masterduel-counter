import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Get all archetypes as a list for admin pannel. */
export const getArchetypesAdminController = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const archetypeService = getDependencies().getArchetypeService();
    const archetypes = await archetypeService.getAllArchetypes(search);
    res.status(200).json({ success: true, archetypes });
  } catch (error) {
    console.error("Error getting archetypes:", error);
    res.status(500).json({ success: false, message: "Failed to get archetypes" });
  }
};
