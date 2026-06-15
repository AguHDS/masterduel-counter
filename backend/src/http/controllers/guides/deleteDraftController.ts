import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";

export const deleteDraftController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const draftId = req.params.draftId;
    if (typeof draftId !== "string") {
      res.status(400).json({ success: false, error: "Invalid draft ID" });
      return;
    }
    const instanceId = parseInt(draftId);
    if (isNaN(instanceId)) {
      res.status(400).json({ success: false, error: "Invalid draft ID" });
      return;
    }

    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const instanceService = getDependencies().getInstanceService();

    // Look up the draft before deleting to check for linked guide request
    const instance = await instanceService.getGuideById(instanceId);
    await instanceService.deleteDraft(instanceId, userId);

    // If the draft was linked to a guide request, revert the request to OPEN
    if (instance?.guideRequestId) {
      try {
        const guideRequestService = getDependencies().getGuideRequestService();
        await guideRequestService.cancelTakeRequest(instance.guideRequestId, userId);
      } catch (err) {
        // Non-fatal: the draft was deleted; just log the error
        console.error("Error reverting guide request after draft deletion:", err);
      }
    }

    res.status(200).json({ success: true, message: "Draft deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Draft not found") {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error.message.startsWith("Unauthorized")) {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      if (error.message === "This guide is not a draft") {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
    }
    console.error("Error deleting draft:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
