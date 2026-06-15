import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import type { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";
import { validateNumberParam } from "@/shared/utils/paramValidation.js";

export const cancelTakeGuideRequestController = async (
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
    const request = await service.cancelTakeRequest(id, user.id);

    // Delete any drafts linked to this request
    try {
      const prisma = getDependencies().getPrismaClient();
      const drafts = await prisma.archetypeInstance.findMany({
        where: { guideRequestId: id, isDraft: true },
      });
      for (const draft of drafts) {
        await prisma.archetypeInstance.delete({ where: { id: draft.id } });
      }
    } catch (err) {
      console.error("Error cleaning up drafts after cancel take:", err);
    }

    res.json({ success: true, data: request });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel take.";
    const status =
      message.includes("not found") ? 404 :
      message.includes("not the one") || message.includes("not in TAKEN") ? 403 :
      500;
    res.status(status).json({ success: false, error: message });
  }
};
