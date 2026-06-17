// @ts-nocheck — standalone script, runs via npx tsx, not compiled by tsc
/**
 * Playwright script to scrape OCG tier list from yugiohmeta.com
 * Opens the page, clicks the OCG toggle, waits for data to load, and prints HTML to stdout
 *
 * Usage: npx tsx src/scripts/scrape-ocg.ts
 * Output: HTML content on stdout
 */
import { chromium } from "playwright";

async function main() {
  console.error("OCG Scraper Launching browser...");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--single-process",
      "--no-sandbox",
      "--disable-extensions",
    ],
  });

  try {
    const context = await browser.newContext({
      userAgent: "MasterDuelCounter/1.0 (tier-list-scraper)",
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    console.error("OCG Scraper Navigating to yugiohmeta.com/tier-list...");
    await page.goto("https://www.yugiohmeta.com/tier-list", {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    console.error("OCG Scraper Waiting for OCG toggle button...");
    await page.waitForSelector("text=OCG", { timeout: 10000 });

    console.error("OCG Scraper Clicking OCG toggle...");
    await page.click("text=OCG");

    console.error("OCG Scraper Waiting for OCG data to render...");
    await page.waitForTimeout(3000);

    console.error("OCG Scraper Extracting HTML...");
    const html = await page.content();

    process.stdout.write(html);
    console.error("OCG Scraper Done. HTML length:", html.length);
  } catch (error) {
    console.error("OCG Scraper Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
