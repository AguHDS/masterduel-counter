import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Controller to get entries of the tierlist */
export const getTierListController = async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as string) || "masterduel";
    const deps = getDependencies();
    const service = deps.getTierListService();
    const entries = await service.getEntries(format);

    res.status(200).json({ success: true, entries });
  } catch (error) {
    console.error("Error getting tier list:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get tier list",
    });
  }
};
