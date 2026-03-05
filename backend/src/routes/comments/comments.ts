import express from "express";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import { createCommentController } from "@/http/controllers/comments/createCommentController.js";
import { getCommentsController } from "@/http/controllers/comments/getCommentsController.js";
import { updateCommentController } from "@/http/controllers/comments/updateCommentController.js";
import { deleteCommentController } from "@/http/controllers/comments/deleteCommentController.js";
import { validateCommentOwnerMiddleware } from "@/http/middlewares/comments/commentAuthMiddleware.js";

const router = express.Router();

// Public routes (anyone can view comments)
router.get("/", getCommentsController);

// Protected routes (require authentication)
router.post("/", requireAuth, createCommentController);
router.patch("/:commentId", requireAuth, validateCommentOwnerMiddleware, updateCommentController);
router.delete("/:commentId", requireAuth, deleteCommentController);

export default router;