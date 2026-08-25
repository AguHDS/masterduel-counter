export interface ScrapedDeck {
  deckName: string;
  tier: number;
  imageUrl: string | null;
}

const TCG_URL = "https://www.yugiohmeta.com/tier-list";
const TIER_2_THRESHOLD = 2.0;
const TIER_3_THRESHOLD = 1.0;

/**
 * Scraper for yugiohmeta.com TCG tier list.
 * Top 3 decks (hero section) = Tier 1. Rest: >= 2% = Tier 2, >= 1% = Tier 3, < 1% = Tier 4.
 */
export class YgoMetaTcgScraper {
  async scrapeTierList(): Promise<ScrapedDeck[]> {
    console.log("[TCG Scraper] Fetching tier list from", TCG_URL);

    const response = await fetch(TCG_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MDCBot/1.0)",
        "Accept": "text/html",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TCG tier list: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log("[TCG Scraper] Got HTML, length:", html.length);

    return this.parseTierList(html);
  }

  protected parseTierList(html: string): ScrapedDeck[] {
    const plainText = html.replace(/<[^>]+>/g, " ");

    // Find all stat matches: (tops) percentage%
    const statPattern = /\((\d+)\)\s+([\d.]+)%/g;
    const statMatches: { tops: number; percentage: number; index: number; endIndex: number }[] = [];
    let statMatch;
    while ((statMatch = statPattern.exec(plainText)) !== null) {
      statMatches.push({
        tops: parseInt(statMatch[1], 10),
        percentage: parseFloat(statMatch[2]),
        index: statMatch.index,
        endIndex: statPattern.lastIndex,
      });
    }

    // Extract deck names from text between stat matches
    const rawDecks: { name: string; tops: number; percentage: number }[] = [];
    for (let i = 0; i < statMatches.length; i++) {
      const curr = statMatches[i];
      const prevEnd = i === 0 ? 0 : statMatches[i - 1].endIndex;
      const textBetween = plainText.slice(prevEnd, curr.index).trim();

      // The deck name is the last segment between 2+ spaces (page uses wide spacing)
      const parts = textBetween.split(/\s{2,}/);
      const name = parts[parts.length - 1].trim();

      // Filter out non-deck entries
      if (
        name.length < 2 ||
        /^(players|events|Total|Last|From|To|Search|Contact|Deck-Types|Techs|Side-Deck|Recent-Events|Custom|Dates)$/i.test(name) ||
        /^\d/.test(name)
      ) {
        continue;
      }

      rawDecks.push({ name, tops: curr.tops, percentage: curr.percentage });
    }

    console.log(`[TCG Scraper] Found ${rawDecks.length} deck entries`);

    const decks: ScrapedDeck[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < rawDecks.length; i++) {
      const deck = rawDecks[i];
      const deckName = deck.name;

      if (seen.has(deckName.toLowerCase())) continue;
      seen.add(deckName.toLowerCase());

      let tier: number;
      if (i < 3) {
        tier = 1;
      } else if (deck.percentage >= TIER_2_THRESHOLD) {
        tier = 2;
      } else if (deck.percentage >= TIER_3_THRESHOLD) {
        tier = 3;
      } else {
        tier = 4;
      }

      decks.push({ deckName, tier, imageUrl: null });
    }

    console.log(
      `[TCG Scraper] Parsed: T1=${decks.filter((d) => d.tier === 1).length}, T2=${decks.filter((d) => d.tier === 2).length}, T3=${decks.filter((d) => d.tier === 3).length}, T4=${decks.filter((d) => d.tier === 4).length}`,
    );

    return decks;
  }
}
