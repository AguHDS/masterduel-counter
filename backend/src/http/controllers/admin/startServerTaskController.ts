import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { ServerTaskType } from "@/domain/ServerManagement.js";

/** Start a maintenance task (download cards, populate archetypes, etc.) - Admin pannel */
export const startServerTaskController = async (req: Request, res: Response) => {
  try {
    const { type, options } = (req.body ?? {}) as {
      type?: string;
      options?: { delay?: number; limit?: number };
    };

    if (!type || typeof type !== "string") {
      res.status(400).json({ success: false, message: "Task type is required" });
      return;
    }

    const service = getDependencies().getServerManagementService();

    try {
      const { task } = await service.startTask(type as ServerTaskType, options);
      res.status(202).json({ success: true, task });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start task";
      res
        .status(message.includes("already running") ? 409 : 400)
        .json({ success: false, message });
    }
  } catch (error) {
    console.error("Error starting server task:", error);
    res.status(500).json({ success: false, message: "Failed to start server task" });
  }
};