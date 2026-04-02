import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";
import { getDependencies } from "@/compositionRoot.js";

/**
 * Toggles a favorite on an archetype instance (add if not exists, remove if exists).
 */
export const toggleGuideFavoriteController = async (
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
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceIdNum = parseInt(instanceId, 10);
    if (isNaN(instanceIdNum)) {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceService = getDependencies().getInstanceService();
    const result = await instanceService.toggleFavoriteGuide(
      instanceIdNum,
      userId,
    );

    res.status(200).json({
      success: true,
      favorited: result.favorited,
      favorites: result.favorites,
    });
  } catch (error) {
    console.error("Error toggling Guide favorite:", error);

    if (error instanceof Error) {
      if (error.message === "Guide not found") {
        res.status(404).json({ success: false, error: error.message });
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
