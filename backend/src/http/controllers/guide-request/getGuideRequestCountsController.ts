import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getGuideRequestCountsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const service = getDependencies().getGuideRequestService();
    const counts = await service.getRequestCounts();
    const all = counts.OPEN + counts.TAKEN + counts.COMPLETED;
    res.json({ success: true, data: { ...counts, ALL: all } });
  } catch (error) {
    console.error("[getGuideRequestCountsController]:", error);
    res.status(500).json({ success: false, error: "Failed to get guide request counts." });
  }
};
