import express, { Request, Response } from "express";
import multer from "multer";
import { getDependencies } from "@/compositionRoot";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});

// GET /api/profile/:userId - Get user profile
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    if (!userIdParam || Array.isArray(userIdParam)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }
    const userId: string = userIdParam;

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
});

// PUT /api/profile/:userId/bio - Update bio
router.put("/:userId/bio", async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const { bio } = req.body;

    if (!userIdParam || Array.isArray(userIdParam)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }
    const userId: string = userIdParam;

    if (typeof bio !== "string") {
      return res.status(400).json({
        success: false,
        message: "Bio must be a string",
      });
    }

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
});

// POST /api/profile/:userId/upload-photo - Upload profile picture
router.post(
  "/:userId/upload-photo",
  upload.single("profilePicture"),
  async (req: Request, res: Response) => {
    try {
      const userIdParam = req.params.userId;

      if (!userIdParam || Array.isArray(userIdParam)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }
      const userId: string = userIdParam;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const profileService = getDependencies().getProfileService();
      const profile = await profileService.uploadProfilePicture(
        userId,
        req.file
      );

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
  }
);

// DELETE /api/profile/:userId/photo - Delete profile picture
router.delete("/:userId/photo", async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    if (!userIdParam || Array.isArray(userIdParam)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }
    const userId: string = userIdParam;

    const profileService = getDependencies().getProfileService();
    const profile = await profileService.deleteProfilePicture(userId);

    return res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete profile picture",
    });
  }
});

export default router;
