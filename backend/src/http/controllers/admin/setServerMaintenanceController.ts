import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Manually toggle maintenance mode - Admin pannel */
export const setServerMaintenanceController = async (req: Request, res: Response) => {
  try {
    const { enabled, message } = (req.body ?? {}) as {
      enabled?: boolean;
      message?: string | null;
    };

    if (typeof enabled !== "boolean") {
      res.status(400).json({ success: false, message: "enabled (boolean) is required" });
      return;
    }

    const result = await getDependencies()
      .getServerManagementService()
      .setMaintenance(enabled, typeof message === "string" ? message : null);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error setting maintenance mode:", error);
    res.status(500).json({ success: false, message: "Failed to set maintenance mode" });
  }
};