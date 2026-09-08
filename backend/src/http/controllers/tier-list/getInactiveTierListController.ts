import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Admin: get soft-deleted (inactive) entries for restore */
export const getInactiveTierListController = async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as string) || "masterduel";
    const deps = getDependencies();
    const service = deps.getTierListService();
    const entries = await service.getInactiveEntries(format);

    res.status(200).json({ success: true, entries });
  } catch (error) {
    console.error("Error getting inactive tier list:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get inactive tier list",
    });
  }
};