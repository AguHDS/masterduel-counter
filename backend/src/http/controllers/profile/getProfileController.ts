import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

export const getProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const profileService = getDependencies().getProfileService();
    const instanceService = getDependencies().getInstanceService();
    
    const [profile, totalViews] = await Promise.all([
      profileService.getProfile(userId),
      instanceService.getTotalViewsByUserId(userId),
    ]);

    return res.json({
      success: true,
      profile,
      totalViews,
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
