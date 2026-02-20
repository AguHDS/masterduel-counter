import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

export const getCommentsController = async (req: Request, res: Response) => {
  try {
    const instanceId = parseInt(req.query.instanceId as string);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (isNaN(instanceId)) {
      return res.status(400).json({ error: "Invalid instance ID" });
    }

    const dependencies = getDependencies();
    const commentService = dependencies.getCommentService();

    const result = await commentService.getCommentsByInstanceId(
      instanceId,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
