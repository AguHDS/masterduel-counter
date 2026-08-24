import { ScrapedDeck } from "./YgoMetaTcgScraper.js";

const OCG_API_URL = "https://www.yugiohmeta.com/api/v1/deck-types/rankings?ocg=true&t3Only=false&range=Last%201%20month&limit=200";
const TIER_2_THRESHOLD = 2.0;
const TIER_3_THRESHOLD = 1.0;

interface ApiDeckEntry {
  deckType: { name?: string };
  decksCount: number;
}

interface ApiResponse {
  deckTypes?: ApiDeckEntry[];
  totalDecks?: number;
}

/**
 * OCG scraper -> calls yugiohmeta.com's JSON API directly
 * Top 3 = Tier 1, >= 2% = Tier 2, >= 1% = Tier 3, < 1% = Tier 4
 */
export class YgoMetaOcgScraper {
  async scrapeTierList(): Promise<ScrapedDeck[]> {
    console.log("OCG Scraper Fetching tier list from API:", OCG_API_URL);

    const response = await fetch(OCG_API_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MDCBot/1.0)",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch OCG tier list: ${response.status} ${response.statusText}`);
    }

    const raw = await response.json() as ApiResponse | ApiResponse[];
    const root = Array.isArray(raw) ? raw[0] : raw;
    const entries = root?.deckTypes ?? [];

    console.log(`OCG Scraper Got ${entries.length} deck types from API`);

    const totalDecks = root?.totalDecks ?? entries.reduce((sum: number, e: ApiDeckEntry) => sum + e.decksCount, 0);
    const decks: ScrapedDeck[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const deckName = (entry.deckType?.name || "").trim();

      if (!deckName || seen.has(deckName.toLowerCase())) continue;
      seen.add(deckName.toLowerCase());

      const percentage = totalDecks > 0 ? (entry.decksCount / totalDecks) * 100 : 0;

      let tier: number;
      if (i < 3) {
        tier = 1;
      } else if (percentage >= TIER_2_THRESHOLD) {
        tier = 2;
      } else if (percentage >= TIER_3_THRESHOLD) {
        tier = 3;
      } else {
        tier = 4;
      }

      decks.push({ deckName, tier, imageUrl: null });
    }

    console.log(
      `OCG Scraper Parsed: T1=${decks.filter((d) => d.tier === 1).length}, T2=${decks.filter((d) => d.tier === 2).length}, T3=${decks.filter((d) => d.tier === 3).length}, T4=${decks.filter((d) => d.tier === 4).length}`,
    );

    return decks;
  }
}
