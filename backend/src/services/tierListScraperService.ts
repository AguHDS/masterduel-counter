import { getDependencies } from "@/compositionRoot.js";

const SCRAPE_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours
const FORMATS = ["masterduel", "tcg"];

export function startTierListScraperService(): void {
  console.log(`Tierlist scraper service started. Interval: 12h. Formats: ${FORMATS.join(", ")}`);

  const runScrape = async () => {
    const deps = getDependencies();

    for (const format of FORMATS) {
      try {
        let config = await deps.getTierListService().getConfig(format);

        if (!config) {
          config = await deps.getTierListService().upsertConfig(format, true);
        } else if (!config.scrapingEnabled) {
          config = await deps.getTierListService().upsertConfig(format, true);
        }

        if (!config.scrapingEnabled) continue;

        console.log(`Tierlist scraper: Running scheduled scrape for ${format}...`);
        await deps.getTierListService().scrapeAndSave(format);
        console.log(`Tierlist scraper: ${format} scrape completed`);
      } catch (error) {
        console.error(`Tierlist scraper ${format} Error:`, error instanceof Error ? error.message : "Unknown error");
      }
    }
  };

  if (process.env.NODE_ENV === "development") {
    setTimeout(runScrape, 10000);
  }

  setInterval(runScrape, SCRAPE_INTERVAL_MS);
}
