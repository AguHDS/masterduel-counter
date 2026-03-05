import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import {
  validateNumberParam,
  validateStringParam,
} from "@/shared/utils/paramValidation.js";

export const updateCommentController = async (req: Request, res: Response) => {
  try {
    const commentId = validateNumberParam(req.params.commentId);
    const content = validateStringParam(req.body?.content);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!commentId) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content cannot be empty" });
    }

    const dependencies = getDependencies();
    const commentService = dependencies.getCommentService();

    const updatedComment = await commentService.updateComment(
      commentId,
      userId,
      { content },
    );

    return res.status(200).json({
      success: true,
      data: { comment: updatedComment },
      message: "Comment updated successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "You can only edit your own comments"
    ) {
      return res.status(403).json({ error: error.message });
    }

    console.error("Error updating comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
