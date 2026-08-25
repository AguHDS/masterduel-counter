import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Restart the backend process (pm2, production only) - Admin pannel */
export const restartServerController = async (_req: Request, res: Response) => {
  try {
    const result = await getDependencies()
      .getServerManagementService()
      .restartServer();
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error restarting server:", error);
    res.status(500).json({ success: false, message: "Failed to restart server" });
  }
};