import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Controller to reorder the tierlist based on the format */
export const reorderTierListController = async (req: Request, res: Response) => {
  try {
    const { format, positions } = req.body;

    if (!format || !positions || !Array.isArray(positions)) {
      res.status(400).json({
        success: false,
        message: "format and positions array are required",
      });
      return;
    }

    const deps = getDependencies();
    const service = deps.getTierListService();
    await service.updatePositions(format, positions);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error reordering tier list:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to reorder tier list",
    });
  }
};
