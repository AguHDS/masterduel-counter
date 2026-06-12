import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";
import { getDependencies } from "@/compositionRoot.js";

/**
 * Toggles a like on a guide (add if not exists, remove if exists).
 * Users cannot like their own guides
 */
export const toggleGuideLikeController = async (
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

    if (typeof instanceId !== 'string') {
      res.status(400).json({ success: false, error: "Invalid Guide ID" });
      return;
    }

    const instanceIdNum = parseInt(instanceId, 10);
    if (isNaN(instanceIdNum)) {
      res.status(400).json({ success: false, error: "Invalid Guide ID" });
      return;
    }

    const instanceService = getDependencies().getInstanceService();
    const result = await instanceService.toggleLikeGuide(instanceIdNum, userId);

    res.status(200).json({
      success: true,
      liked: result.liked,
      likes: result.likes,
    });
  } catch (error) {
    console.error("Error toggling Guide like:", error);

    if (error instanceof Error) {
      // Handle specific business logic errors
      if (error.message === "Guide not found") {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error.message === "You cannot like your own guide") {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      
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
