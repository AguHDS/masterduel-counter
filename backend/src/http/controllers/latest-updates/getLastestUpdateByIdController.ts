import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getLatestUpdateByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid ID" });
      return;
    }

    const service = getDependencies().getLatestUpdateService();
    const post = await service.findLastestUpdateById(id);

    if (!post) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error("Error fetching latest update:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
