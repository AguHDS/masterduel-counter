import express from "express";
import multer from "multer";
import { getProfileController } from "@/http/controllers/profile/getProfileController.js";
import { updateBioController } from "@/http/controllers/profile/updateBioController.js";
import { uploadProfilePictureController } from "@/http/controllers/profile/uploadProfilePictureController.js";
import { deleteProfilePictureController } from "@/http/controllers/profile/deleteProfilePictureController.js";
import { updateFavoriteCardAndDecksController } from "@/http/controllers/profile/updateFavoriteCardAndDecksController.js";
import { getFavoritedGuidesController } from "@/http/controllers/profile/getFavoritedGuidesController.js";
import { validateBioMiddleware } from "@/http/middlewares/profile/validateBioMiddleware.js";
import { validateFavoriteCardAndDecksMiddleware } from "@/http/middlewares/profile/validateFavoriteCardAndDecksMiddleware.js";
import { validateUserIdMiddleware } from "@/http/middlewares/validateUserIdMiddleware.js";
import { profilePictureUploadMiddleware } from "@/http/middlewares/profile/profilePictureUploadMiddleware.js";

const router = express.Router();

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

router.post(
  "/:userId/upload-photo",
  validateUserIdMiddleware,
  upload.single("profilePicture"),
  profilePictureUploadMiddleware,
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
