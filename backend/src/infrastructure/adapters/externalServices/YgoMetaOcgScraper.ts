import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { ScrapedDeck, YgoMetaTcgScraper } from "./YgoMetaTcgScraper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRAPE_SCRIPT = resolve(__dirname, "../../../scripts/scrape-ocg.ts");
const TIMEOUT_MS = 45000;

/**
 * OCG scraper. Extends the TCG parser but fetches HTML via Playwright
 * (clicks the OCG toggle, which is js-only)
 */
export class YgoMetaOcgScraper extends YgoMetaTcgScraper {
  async scrapeTierList(): Promise<ScrapedDeck[]> {
    const html = execSync(`npx tsx "${SCRAPE_SCRIPT}"`, {
      encoding: "utf-8",
      timeout: TIMEOUT_MS,
      stdio: ["ignore", "pipe", "pipe"],
    });

    console.log("OCG-Scrapper Got HTML from Playwright, length:", html.length);
    return this.parseTierList(html);
  }
}
