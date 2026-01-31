import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

export const uploadProfilePictureController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params.userId as string;
    const file = req.file!; // Validado por middleware

    const profileService = getDependencies().getProfileService();
    const profile = await profileService.uploadProfilePicture(userId, file);

    return res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to upload profile picture",
    });
  }
};
