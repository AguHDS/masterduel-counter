import express from "express";
import multer from "multer";
import { getProfileController } from "@/http/controllers/getProfileController";
import { updateBioController } from "@/http/controllers/updateBioController";
import { uploadProfilePictureController } from "@/http/controllers/uploadProfilePictureController";
import { deleteProfilePictureController } from "@/http/controllers/deleteProfilePictureController";
import { validateUserIdMiddleware } from "@/http/middlewares/validateUserIdMiddleware";
import { validateBioMiddleware } from "@/http/middlewares/validateBioMiddleware";
import { validateFileUploadMiddleware } from "@/http/middlewares/validateFileUploadMiddleware";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});

// GET /api/profile/:userId - Get user profile
router.get("/:userId", validateUserIdMiddleware, getProfileController);

// PUT /api/profile/:userId/bio - Update bio
router.put(
  "/:userId/bio",
  validateUserIdMiddleware,
  validateBioMiddleware,
  updateBioController
);

// POST /api/profile/:userId/upload-photo - Upload profile picture
router.post(
  "/:userId/upload-photo",
  validateUserIdMiddleware,
  upload.single("profilePicture"),
  validateFileUploadMiddleware,
  uploadProfilePictureController
);

// DELETE /api/profile/:userId/photo - Delete profile picture
router.delete(
  "/:userId/photo",
  validateUserIdMiddleware,
  deleteProfilePictureController
);

export default router;
