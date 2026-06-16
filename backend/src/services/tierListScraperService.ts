import { getDependencies } from "@/compositionRoot.js";

const SCRAPE_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

/** Scrapper service for tierlist */
export function startTierListScraperService(): void {
  console.log("Tierlist scraper service started. Interval: 12h");

  const runScrape = async () => {
    try {
      const deps = getDependencies();
      let config = await deps.getTierListService().getConfig("masterduel");

      if (!config) {
        config = await deps.getTierListService().upsertConfig("masterduel", true);
      } else if (!config.scrapingEnabled) {
        console.log("Tierlist scrapper: Auto-enabling scraping (was disabled from old default)");
        config = await deps.getTierListService().upsertConfig("masterduel", true);
      }

      if (!config.scrapingEnabled) {
        return;
      }

      console.log("Tierlist scraper: Running scheduled scrape...");
      await deps.getTierListService().scrapeAndSave("masterduel");
      console.log("Scheduled scrape completed");
    } catch (error) {
      console.error("Tierlist scraper Error:", error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Run once on startup (in development)
  if (process.env.NODE_ENV === "development") {
    setTimeout(runScrape, 10000);
  }

  setInterval(runScrape, SCRAPE_INTERVAL_MS);
}
