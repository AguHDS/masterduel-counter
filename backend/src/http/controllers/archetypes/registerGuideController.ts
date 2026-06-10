import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";

/** Registers or updates a guide and mark the archetype as registered */
export const registerGuideController = async (
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
    const { guideType, cardPairs, initialHands, title, headerCardId, generalTip, instanceId, comboSteps, draftInstanceId } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Sanitize spaces in the title only (not generalTip - it should preserve formatting)
    const sanitizedTitle = title.replace(/\s+/g, " ").trim();
    
    // generalTip should preserve spaces and line breaks, only trim edges
    const processedGeneralTip = generalTip ? generalTip.trim() : null;

    const instanceService = getDependencies().getInstanceService();

    const instance = await instanceService.registerGuide({
      archetypeId,
      userId,
      guideType,
      title: sanitizedTitle,
      headerCardId,
      generalTip: processedGeneralTip,
      cardPairs: guideType === "COUNTER" ? cardPairs : undefined,
      initialHands: guideType === "DECK" ? initialHands : undefined,
      instanceId,
      comboSteps: guideType === "DECK" ? comboSteps : undefined,
      draftInstanceId: draftInstanceId ? parseInt(String(draftInstanceId), 10) : undefined,
    });

    res.status(200).json({
      success: true,
      instance,
      message: "Archetype instance registered successfully",
    });
  } catch (error) {
    console.error("Error registering archetype:", error);

    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
};
