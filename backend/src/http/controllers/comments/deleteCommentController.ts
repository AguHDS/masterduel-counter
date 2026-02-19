// backend/src/http/controllers/comments/deleteCommentController.ts
import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { validateNumberParam } from "@/shared/utils/paramValidation";

export const deleteCommentController = async (req: Request, res: Response) => {
  try {
    const commentId = validateNumberParam(req.params.commentId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!commentId) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const dependencies = getDependencies();
    const commentService = dependencies.getCommentService();

    await commentService.deleteComment(commentId, userId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "You don't have permission to delete this comment"
    ) {
      return res.status(403).json({ error: error.message });
    }

    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
