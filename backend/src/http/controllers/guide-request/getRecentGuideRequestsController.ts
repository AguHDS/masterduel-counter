import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getRecentGuideRequestsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const limit = Math.min(30, Math.max(1, parseInt(String(req.query.limit ?? "15"), 10) || 15));

    const service = getDependencies().getGuideRequestService();
    const items = await service.getRecentOpenRequests(limit);

    res.json({ success: true, data: items });
  } catch (error) {
    console.error("[getRecentGuideRequestsController]:", error);
    res.status(500).json({ success: false, error: "Failed to get recent guide requests." });
  }
};
