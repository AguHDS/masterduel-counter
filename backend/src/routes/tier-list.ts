import express from "express";
import { getTierListController } from "@/http/controllers/tier-list/getTierListController.js";
import { getTierListConfigController } from "@/http/controllers/tier-list/getTierListConfigController.js";
import { updateTierListConfigController } from "@/http/controllers/tier-list/updateTierListConfigController.js";
import { triggerScrapeController } from "@/http/controllers/tier-list/triggerScrapeController.js";
import { saveTierListController } from "@/http/controllers/tier-list/saveTierListController.js";
import { reorderTierListController } from "@/http/controllers/tier-list/reorderTierListController.js";

const router = express.Router();

// Public: get the current tier list for display
router.get("/", getTierListController);
// Admin: read scraping config (enabled, last scrape time)
router.get("/config", getTierListConfigController);
// Admin: toggle auto-scraping on/off
router.put("/config", updateTierListConfigController);
// Admin: trigger an immediate scrape
router.post("/scrape", triggerScrapeController);
// Admin: bulk-save all entries (full replacement)
router.post("/save", saveTierListController);
// Admin: reorder entries within tiers
router.put("/entries/reorder", reorderTierListController);

export default router;
