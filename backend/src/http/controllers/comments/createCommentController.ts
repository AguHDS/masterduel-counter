import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import {
  validateNumberParam,
  validateStringParam,
} from "@/shared/utils/paramValidation";

export const createCommentController = async (req: Request, res: Response) => {
  try {
    const { instanceId, content, parentCommentId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const validatedInstanceId = validateNumberParam(instanceId);
    const validatedContent = validateStringParam(content);
    const validatedParentId = parentCommentId
      ? validateNumberParam(parentCommentId)
      : null;

    if (!validatedInstanceId) {
      return res.status(400).json({ error: "Invalid instance ID" });
    }

    if (!validatedContent) {
      return res.status(400).json({ error: "Content cannot be empty" });
    }

    const dependencies = getDependencies();
    const commentService = dependencies.getCommentService();

    const comment = await commentService.createComment({
      instanceId: validatedInstanceId,
      authorId: userId,
      content: validatedContent,
      parentCommentId: validatedParentId,
    });

    return res.status(201).json({
      success: true,
      data: { comment },
      message: "Comment created successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Parent comment not found") ||
        error.message.includes("Comment is too long"))
    ) {
      return res.status(400).json({ error: error.message });
    }

    console.error("Error creating comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
