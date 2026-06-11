import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";

export const saveDraftController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    if (typeof id !== "string") {
      res.status(400).json({ success: false, error: "Invalid archetype ID" });
      return;
    }
    const archetypeId = parseInt(id);
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const {
      guideType,
      title,
      headerCardId,
      generalTip,
      cardPairs,
      initialHands,
      comboSteps,
      draftInstanceId,
      guideRequestId,
    } = req.body;

    if (!guideType || (guideType !== "COUNTER" && guideType !== "DECK")) {
      res.status(400).json({ success: false, error: "Invalid guide type" });
      return;
    }

    const instanceService = getDependencies().getInstanceService();

    const draft = await instanceService.saveDraft({
      archetypeId,
      userId,
      guideType,
      title: title ? String(title).replace(/\s+/g, " ").trim() : undefined,
      headerCardId: headerCardId ?? null,
      generalTip: generalTip ? String(generalTip).trim() : null,
      cardPairs: guideType === "COUNTER" ? cardPairs : undefined,
      initialHands: guideType === "DECK" ? initialHands : undefined,
      comboSteps: guideType === "DECK" ? comboSteps : undefined,
      draftInstanceId: draftInstanceId ? parseInt(String(draftInstanceId), 10) : undefined,
      guideRequestId: guideRequestId ? parseInt(String(guideRequestId), 10) : undefined,
    });

    res.status(200).json({
      success: true,
      draft,
      message: "Guide saved as draft, you can find it in your profile in the Guides tab",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "You can't have more than three draft at a time") {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      if (error.message === "Draft not found") {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error.message.startsWith("Unauthorized")) {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
    }
    if (error instanceof Error && (error as Error & { code: string }).code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      res.status(400).json({ success: false, error: "Some cards selected do not exist in the database. Please remove and re-add them." });
      return;
    }
    console.error("Error saving draft:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
