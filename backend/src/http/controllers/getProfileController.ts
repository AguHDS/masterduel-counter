import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

export const getProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const profileService = getDependencies().getProfileService();
    const profile = await profileService.getProfile(userId);

    return res.json({
      success: true,
      profile,
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
