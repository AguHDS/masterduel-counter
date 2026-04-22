import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import type { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";

export const createGuideRequestController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, archetypeId, guideType } = req.body as {
      title: string;
      description?: string;
      archetypeId: number;
      guideType: "COUNTER" | "DECK";
    };

    const user = (req as AuthenticatedRequest).user;

    const service = getDependencies().getGuideRequestService();
    const request = await service.createRequest({
      title: title.trim(),
      description: description?.trim(),
      archetypeId: Number(archetypeId),
      guideType,
      requesterId: user?.id,
      requesterName: user?.name,
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error("[createGuideRequestController]:", error);
    res.status(500).json({ success: false, error: "Failed to create guide request." });
  }
};
