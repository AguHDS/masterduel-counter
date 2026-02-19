import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

export const createCommentController = async (req: Request, res: Response) => {
  try {
    const { instanceId, content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!instanceId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Content cannot be empty" });
    }

    const dependencies = getDependencies();
    const commentService = dependencies.getCommentService();

    const comment = await commentService.createComment({
      instanceId: parseInt(instanceId),
      authorId: userId,
      content: content.trim(),
    });

    return res.status(201).json({
      success: true,
      data: { comment },
      message: "Comment created successfully",
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
