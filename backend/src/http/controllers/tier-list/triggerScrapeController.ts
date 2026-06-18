import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Controller to trigger the scrape for the tierlist */
export const triggerScrapeController = async (req: Request, res: Response) => {
  try {
    const format = (req.body?.format as string) || (req.query.format as string) || "masterduel";
    const deps = getDependencies();
    const service = deps.getTierListService();
    const entries = await service.scrapeAndSave(format);
    
    res.status(200).json({ success: true, entries });
  } catch (error) {
    console.error("Error scraping tier list:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to scrape tier list",
    });
  }
};
