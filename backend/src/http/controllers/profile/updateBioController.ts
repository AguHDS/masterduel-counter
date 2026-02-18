import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

export const updateBioController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { bio } = req.body;

    const profileService = getDependencies().getProfileService();
    const profile = await profileService.updateBio(userId, bio);

    return res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error updating bio:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update bio",
    });
  }
};
