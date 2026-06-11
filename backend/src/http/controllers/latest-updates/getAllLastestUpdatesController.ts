import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getAllLatestUpdatesController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const service = getDependencies().getLatestUpdateService();
    const posts = await service.findAllLastestUpdates(3);

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Error fetching latest updates:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
