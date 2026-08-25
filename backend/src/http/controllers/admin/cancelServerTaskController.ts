import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Cancel the currently running maintenance task - Admin pannel */
export const cancelServerTaskController = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await getDependencies()
      .getServerManagementService()
      .cancelTask(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Error cancelling server task:", error);
    res.status(500).json({ success: false, message: "Failed to cancel server task" });
  }
};