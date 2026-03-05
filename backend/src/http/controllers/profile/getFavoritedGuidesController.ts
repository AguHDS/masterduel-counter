import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/**
 * Gets all favorited guides/instances by a user
 */
export const getFavoritedGuidesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId || Array.isArray(userId)) {
      res.status(400).json({ success: false, error: "Invalid User ID" });
      return;
    }

    const instanceService = getDependencies().getInstanceService();
    const favoritedGuides = await instanceService.getFavoritedInstancesByUserId(userId);

    res.status(200).json({
      success: true,
      guides: favoritedGuides,
    });
  } catch (error) {
    console.error("Error getting favorited guides:", error);

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
