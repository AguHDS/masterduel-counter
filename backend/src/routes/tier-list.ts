import express from "express";
import { getTierListController } from "@/http/controllers/tier-list/getTierListController.js";
import { getTierListConfigController } from "@/http/controllers/tier-list/getTierListConfigController.js";
import { updateTierListConfigController } from "@/http/controllers/tier-list/updateTierListConfigController.js";
import { triggerScrapeController } from "@/http/controllers/tier-list/triggerScrapeController.js";
import { saveTierListController } from "@/http/controllers/tier-list/saveTierListController.js";
import { reorderTierListController } from "@/http/controllers/tier-list/reorderTierListController.js";

const router = express.Router();

router.get("/", getTierListController);
router.get("/config", getTierListConfigController);
router.put("/config", updateTierListConfigController);
router.post("/scrape", triggerScrapeController);
router.post("/save", saveTierListController);
router.put("/entries/reorder", reorderTierListController);

export default router;
