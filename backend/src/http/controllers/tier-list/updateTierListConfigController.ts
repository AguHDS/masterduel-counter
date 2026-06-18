import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Controller to update the tierlist based on config */
export const updateTierListConfigController = async (req: Request, res: Response) => {
  try {
    const format = (req.body?.format as string) || "masterduel";
    const scrapingEnabled = req.body?.scrapingEnabled === true;

    const deps = getDependencies();
    const service = deps.getTierListService();
    const config = await service.upsertConfig(format, scrapingEnabled);

    res.status(200).json({ success: true, config });
  } catch (error) {
    console.error("Error updating tier list config:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update tier list config",
    });
  }
};
