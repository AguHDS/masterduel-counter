export interface ScrapedDeck {
  deckName: string;
  tier: number;
  imageUrl: string | null;
}

/** Parses masterduelmeta.com/tier-list HTML into deck names + tiers */
export class MasterDuelMetaScraper {
  private readonly url = "https://www.masterduelmeta.com/tier-list";

  // Fetches HTML and returns list of { deckName, tier }
  async scrapeTierList(): Promise<ScrapedDeck[]> {
    const response = await fetch(this.url, {
      headers: {
        "User-Agent": "MasterDuelCounter/1.0 (tier-list-scraper)",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tier list: ${response.status} ${response.statusText}`,
      );
    }

    const html = await response.text();
    const decks = this.parseTierList(html);

    return decks;
  }

  // Primary parser: splits HTML by <hr> separators within the Power Rankings section
  private parseTierList(html: string): ScrapedDeck[] {
    const decks: ScrapedDeck[] = [];
    const seen = new Set<string>();

    // Find the Power Rankings section
    const powerRankingsStart = html.indexOf("Power Rankings");
    if (powerRankingsStart < 0) {
      return this.parseByTierContainers(html);
    }

    // Find the Popularity Rankings section to limit scope
    const popularityStart = html.indexOf(
      "Popularity Rankings",
      powerRankingsStart,
    );
    const scopeEnd = popularityStart > 0 ? popularityStart : html.length;

    const scopeHtml = html.slice(powerRankingsStart, scopeEnd);

    // Find <hr> tag positions within scope
    const hrPositions: number[] = [];
    const hrRegex = /<hr[^>]*\/?>/gi;
    let hrMatch;
    while ((hrMatch = hrRegex.exec(scopeHtml)) !== null) {
      hrPositions.push(hrMatch.index);
    }

    if (hrPositions.length < 2) {
      return this.parseByTierContainers(html);
    }

    // Define segments: before first hr = Tier 1, between hr[0] and hr[1] = Tier 2, after hr[1] = Tier 3
    const segments = [
      { start: 0, end: hrPositions[0], tier: 1 },
      { start: hrPositions[0], end: hrPositions[1], tier: 2 },
      { start: hrPositions[1], end: scopeHtml.length, tier: 3 },
    ];

    const deckLinkRegex = /\/tier-list\/deck-types\/([^"]+)/gi;

    for (const segment of segments) {
      const sectionHtml = scopeHtml.slice(segment.start, segment.end);
      let match;
      while ((match = deckLinkRegex.exec(sectionHtml)) !== null) {
        const urlSlug = match[1];
        const deckName = decodeURIComponent(urlSlug).trim();

        if (!seen.has(deckName)) {
          seen.add(deckName);
          decks.push({
            deckName,
            tier: segment.tier,
            imageUrl: null,
          });
        }
      }
      deckLinkRegex.lastIndex = 0;
    }

    return decks;
  }

  // Fallback: finds tier-img-container elements when <hr> separators are absent
  private parseByTierContainers(html: string): ScrapedDeck[] {
    const decks: ScrapedDeck[] = [];
    const seen = new Set<string>();

    // Find tier-img-container positions
    const containerPositions: number[] = [];
    const containerRegex = /class="[^"]*tier-img-container[^"]*"/gi;
    let match;
    while ((match = containerRegex.exec(html)) !== null) {
      containerPositions.push(match.index);
    }

    if (containerPositions.length === 0) {
      return decks;
    }

    const deckLinkRegex = /\/tier-list\/deck-types\/([^"]+)/gi;

    for (let i = 0; i < containerPositions.length && i < 3; i++) {
      const tier = i + 1;
      const startPos = containerPositions[i];
      const endPos =
        i + 1 < containerPositions.length
          ? containerPositions[i + 1]
          : html.length;

      const sectionHtml = html.slice(startPos, endPos);
      let linkMatch;
      while ((linkMatch = deckLinkRegex.exec(sectionHtml)) !== null) {
        const urlSlug = linkMatch[1];
        const deckName = decodeURIComponent(urlSlug).trim();

        if (!seen.has(deckName)) {
          seen.add(deckName);
          decks.push({ deckName, tier, imageUrl: null });
        }
      }
      deckLinkRegex.lastIndex = 0;
    }

    return decks;
  }
}
