import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";
import { getDependencies } from "@/compositionRoot.js";

/**
 * Check if the current user has favorited a specific guide instance
 */
export const checkGuideFavoriteStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { instanceId } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (typeof instanceId !== "string") {
      res.status(400).json({ success: false, error: "Invalid guide ID" });
      return;
    }

    const instanceIdNum = parseInt(instanceId, 10);
    if (isNaN(instanceIdNum)) {
      res.status(400).json({ success: false, error: "Invalid guide ID" });
      return;
    }

    const instanceService = getDependencies().getInstanceService();
    const favorited = await instanceService.hasUserFavoritedGuide(
      instanceIdNum,
      userId,
    );

    res.status(200).json({
      success: true,
      favorited,
    });
  } catch (error) {
    console.error("Error getting guide favorite status:", error);

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
