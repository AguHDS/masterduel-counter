import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";
import { getDependencies } from "@/compositionRoot.js";

/**
 * Checks if the current user has liked a specific instance.
 * 
 * @returns Whether the user has liked the instance
 */
export const getInstanceLikeStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { instanceId } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      res.status(200).json({ success: true, liked: false });
      return;
    }

    if (typeof instanceId !== 'string') {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceIdNum = parseInt(instanceId, 10);
    if (isNaN(instanceIdNum)) {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceService = getDependencies().getInstanceService();
    const liked = await instanceService.hasUserLikedInstance(instanceIdNum, userId);

    res.status(200).json({
      success: true,
      liked,
    });
  } catch (error) {
    console.error("Error checking instance like status:", error);

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
