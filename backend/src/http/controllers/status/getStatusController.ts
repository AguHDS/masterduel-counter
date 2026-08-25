import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Public endpoint: maintenance flag consumed by the frontend gate */
export const getStatusController = async (_req: Request, res: Response) => {
  try {
    const status = getDependencies().getServerManagementService().getPublicStatus();
    res.status(200).json({ success: true, ...status });
  } catch (error) {
    console.error("Error getting site status:", error);
    res.status(500).json({ success: false, message: "Failed to get site status" });
  }
};