import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/**
 * Registers a view for a guide
 * No authentication required - tracks views from all users.
 * The service uses in-memory caching to reduce database writes.
 */
export const registerGuideViewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { instanceId } = req.params;

    if (typeof instanceId !== 'string') {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceIdNum = parseInt(instanceId, 10);
    if (isNaN(instanceIdNum)) {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceService = getDependencies().getInstanceService();
    await instanceService.registerView(instanceIdNum);

    res.status(200).json({ 
      success: true,
      message: "View registered successfully" 
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Guide not found") {
      res.status(404).json({ success: false, error: error.message });
      return;
    }

    console.error("Error registering instance view:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to register view" 
    });
  }
};
