import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getProfileController = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId as string;
    const profileService = getDependencies().getProfileService();

    const { profile, totalViews, rank } =
      await profileService.getPublicProfilePageData(userIdParam);

    return res.json({
      success: true,
      profile,
      totalViews,
      rank,
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get profile",
    });
  }
};
