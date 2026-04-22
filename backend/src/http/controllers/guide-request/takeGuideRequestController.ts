import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import type { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";
import { validateNumberParam } from "@/shared/utils/paramValidation.js";

export const takeGuideRequestController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = validateNumberParam(req.params.id);

    if (id === null) {
      res.status(400).json({ error: "Invalid request ID." });
      return;
    }

    const user = (req as AuthenticatedRequest).user!;

    const service = getDependencies().getGuideRequestService();
    const result = await service.takeRequest(id, user.id, user.name);

    if (!result.success) {
      res.status(409).json({ success: false, error: result.message });
      return;
    }

    res.json({ success: true, message: result.message, data: result.request });
  } catch (error) {
    console.error("[takeGuideRequestController]:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to take guide request." });
  }
};
