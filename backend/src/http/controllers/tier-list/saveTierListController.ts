import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Controller to save the tierlist */
export const saveTierListController = async (req: Request, res: Response) => {
  try {
    const { format, entries } = req.body;

    if (!format || !entries || !Array.isArray(entries)) {
      res.status(400).json({
        success: false,
        message: "format and entries array are required",
      });
      return;
    }

    for (const entry of entries) {
      if (!entry.deckName || typeof entry.tier !== "number" || entry.tier < 1 || entry.tier > 3) {
        res.status(400).json({
          success: false,
          message: "Each entry must have deckName and tier (1-3)",
        });
        return;
      }
    }

    const deps = getDependencies();
    const service = deps.getTierListService();
    await service.saveEntries(format, {
      entries: entries.map((e: { id?: number; deckName: string; tier: number; position: number; imageUrl: string | null; source: string }, index: number) => ({
        id: e.id,
        deckName: e.deckName,
        tier: e.tier,
        position: e.position ?? index,
        imageUrl: e.imageUrl ?? null,
        source: (e.source === "scraped" || e.source === "manual" ? e.source : "manual"),
      })),
    });

    const updatedEntries = await service.getEntries(format);
    res.status(200).json({ success: true, entries: updatedEntries });
  } catch (error) {
    console.error("Error saving tier list:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to save tier list",
    });
  }
};
