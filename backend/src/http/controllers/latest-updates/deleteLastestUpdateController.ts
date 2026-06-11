import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const deleteLatestUpdateController = async (
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
    await service.deleteLastestUpdate(id);

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting latest update:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
