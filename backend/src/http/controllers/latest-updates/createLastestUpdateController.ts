import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import type { AdminRequest } from "@/http/middlewares/admin/verifyAdminMiddleware.js";

export const createLatestUpdateController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title, content } = req.body;
    const adminReq = req as AdminRequest;
    const authorId = adminReq.adminUser?.id;

    if (!title || !content) {
      res.status(400).json({
        success: false,
        error: "Title and content are required",
      });
      return;
    }

    const service = getDependencies().getLatestUpdateService();
    const post = await service.CreateLatestUpdate({ title, content, authorId: authorId! });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error("Error creating latest update:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
