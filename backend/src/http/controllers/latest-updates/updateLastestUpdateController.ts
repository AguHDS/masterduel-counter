import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const updateLatestUpdateController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid ID" });
      return;
    }

    const { title, content } = req.body;

    if (!title && !content) {
      res
        .status(400)
        .json({ success: false, error: "Title or content is required" });
      return;
    }

    const service = getDependencies().getLatestUpdateService();
    const post = await service.updateLastestUpdate(id, { title, content });

    res.json({ success: true, data: post });
  } catch (error) {
    console.error("Error updating latest update:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
