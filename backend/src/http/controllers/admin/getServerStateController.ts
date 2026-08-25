import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Get server management state (maintenance, running task, log tail) - Admin pannel */
export const getServerStateController = async (_req: Request, res: Response) => {
  try {
    const state = getDependencies().getServerManagementService().getState();
    res.status(200).json({ success: true, ...state });
  } catch (error) {
    console.error("Error getting server state:", error);
    res.status(500).json({ success: false, message: "Failed to get server state" });
  }
};