import express from "express";
import multer from "multer";
import { getProfileController } from "@/http/controllers/profile/getProfileController";
import { updateBioController } from "@/http/controllers/profile/updateBioController";
import { uploadProfilePictureController } from "@/http/controllers/profile/uploadProfilePictureController";
import { deleteProfilePictureController } from "@/http/controllers/profile/deleteProfilePictureController";
import { updateFavoriteCardAndDecksController } from "@/http/controllers/profile/updateFavoriteCardAndDecksController";
import { getFavoritedGuidesController } from "@/http/controllers/profile/getFavoritedGuidesController";
import { validateBioMiddleware } from "@/http/middlewares/profile/validateBioMiddleware";
import { validateFavoriteCardAndDecksMiddleware } from "@/http/middlewares/profile/validateFavoriteCardAndDecksMiddleware";
import { validateUserIdMiddleware } from "@/http/middlewares/validateUserIdMiddleware";
import { validateFileUploadMiddleware } from "@/http/middlewares/validateFileUploadMiddleware";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});

// Get user profile
router.get("/:userId", validateUserIdMiddleware, getProfileController);

// Update bio
router.put(
  "/:userId/bio",
  validateUserIdMiddleware,
  validateBioMiddleware,
  updateBioController,
);

// Upload profile picture
router.post(
  "/:userId/upload-photo",
  validateUserIdMiddleware,
  upload.single("profilePicture"),
  validateFileUploadMiddleware,
  uploadProfilePictureController,
);

// Delete profile picture
router.delete(
  "/:userId/photo",
  validateUserIdMiddleware,
  deleteProfilePictureController,
);

// Update favorite decks and card
router.put(
  "/:userId/favorites",
  validateUserIdMiddleware,
  validateFavoriteCardAndDecksMiddleware,
  updateFavoriteCardAndDecksController,
);

// Get favorited guides
router.get(
  "/:userId/favoritedGuides",
  validateUserIdMiddleware,
  getFavoritedGuidesController,
);

export default router;
