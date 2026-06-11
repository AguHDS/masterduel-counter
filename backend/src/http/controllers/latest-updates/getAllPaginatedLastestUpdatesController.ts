import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getAllPaginatedLastestUpdatesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20));

    const service = getDependencies().getLatestUpdateService();
    const result = await service.findAllPaginatedLastestUpdates(page, limit);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching paginated updates:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
