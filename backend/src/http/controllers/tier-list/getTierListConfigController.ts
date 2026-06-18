import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Controller to get the config of tierlist */
export const getTierListConfigController = async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as string) || "masterduel";
    const deps = getDependencies();
    const service = deps.getTierListService();
    const config = await service.getConfig(format);
    
    res.status(200).json({ success: true, config });
  } catch (error) {
    console.error("Error getting tier list config:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get tier list config",
    });
  }
};
