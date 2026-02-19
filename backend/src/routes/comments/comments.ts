import express from "express";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware";
import { createCommentController } from "@/http/controllers/comments/createCommentController";
import { getCommentsController } from "@/http/controllers/comments/getCommentsController";
import { updateCommentController } from "@/http/controllers/comments/updateCommentController";
import { deleteCommentController } from "@/http/controllers/comments/deleteCommentController";
import { validateCommentOwnerMiddleware } from "@/http/middlewares/comments/commentAuthMiddleware";

const router = express.Router();

// Public routes (anyone can view comments)
router.get("/", getCommentsController);

// Protected routes (require authentication)
router.post("/", requireAuth, createCommentController);
router.patch("/:commentId", requireAuth, validateCommentOwnerMiddleware, updateCommentController);
router.delete("/:commentId", requireAuth, deleteCommentController);

export default router;