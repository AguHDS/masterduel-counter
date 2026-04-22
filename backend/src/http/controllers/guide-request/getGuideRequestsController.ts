import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getGuideRequestsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20));
    const status = req.query.status ? String(req.query.status) : undefined;

    if (status && !["OPEN", "TAKEN", "COMPLETED"].includes(status)) {
      res.status(400).json({ error: "status must be OPEN, TAKEN, or COMPLETED." });
      return;
    }

    const service = getDependencies().getGuideRequestService();
    const result = await service.getRequests(page, limit, status);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[getGuideRequestsController]:", error);
    res.status(500).json({ success: false, error: "Failed to get guide requests." });
  }
};
