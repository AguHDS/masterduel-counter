export interface ScrapedDeck {
  deckName: string;
  tier: number;
  imageUrl: string | null;
}

/** Parses masterduelmeta.com/tier-list HTML into deck names + tiers */
export class MasterDuelMetaScraper {
  private readonly url = "https://www.masterduelmeta.com/tier-list";

  async scrapeTierList(): Promise<ScrapedDeck[]> {
    const response = await fetch(this.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MDCBot/1.0)",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tier list: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return this.parseTierList(html);
  }

  private parseTierList(html: string): ScrapedDeck[] {
    const decks: ScrapedDeck[] = [];
    const seen = new Set<string>();

    const powerRankingsStart = html.indexOf("Power Rankings");
    if (powerRankingsStart < 0) {
      return this.parseByTierContainers(html);
    }

    const popularityStart = html.indexOf("Popularity Rankings", powerRankingsStart);
    const scopeEnd = popularityStart > 0 ? popularityStart : html.length;
    const scopeHtml = html.slice(powerRankingsStart, scopeEnd);

    const hrPositions: number[] = [];
    const hrRegex = /<hr[^>]*\/?>/gi;
    let hrMatch;
    while ((hrMatch = hrRegex.exec(scopeHtml)) !== null) {
      hrPositions.push(hrMatch.index);
    }

    if (hrPositions.length < 1) {
      return this.parseByTierContainers(html);
    }

    const segments: { start: number; end: number; tier: number }[] = [];
    for (let i = 0; i <= hrPositions.length; i++) {
      segments.push({
        start: i === 0 ? 0 : hrPositions[i - 1],
        end: i < hrPositions.length ? hrPositions[i] : scopeHtml.length,
        tier: i + 1,
      });
    }

    const deckLinkRegex = /\/tier-list\/deck-types\/([^"]+)/gi;

    for (const segment of segments) {
      const sectionHtml = scopeHtml.slice(segment.start, segment.end);
      let match;
      while ((match = deckLinkRegex.exec(sectionHtml)) !== null) {
        const urlSlug = match[1];
        const deckName = decodeURIComponent(urlSlug).trim();
        if (!seen.has(deckName)) {
          seen.add(deckName);
          decks.push({ deckName, tier: segment.tier, imageUrl: null });
        }
      }
      deckLinkRegex.lastIndex = 0;

      if (segment.tier >= 3) {
        const engineRegex = /\/tier-list\/engines\/([^"]+)/gi;
        let engineMatch;
        while ((engineMatch = engineRegex.exec(sectionHtml)) !== null) {
          const deckName = decodeURIComponent(engineMatch[1]).trim() + " Engine";
          if (!seen.has(deckName)) {
            seen.add(deckName);
            decks.push({ deckName, tier: segment.tier, imageUrl: null });
          }
        }
      }
    }

    return decks;
  }

  private parseByTierContainers(html: string): ScrapedDeck[] {
    const decks: ScrapedDeck[] = [];
    const seen = new Set<string>();

    const containerPositions: number[] = [];
    const containerRegex = /class="[^"]*tier-img-container[^"]*"/gi;
    let match;
    while ((match = containerRegex.exec(html)) !== null) {
      containerPositions.push(match.index);
    }

    if (containerPositions.length === 0) return decks;

    const deckLinkRegex = /\/tier-list\/deck-types\/([^"]+)/gi;

    for (let i = 0; i < containerPositions.length; i++) {
      const tier = i + 1;
      const startPos = containerPositions[i];
      const endPos = i + 1 < containerPositions.length ? containerPositions[i + 1] : html.length;

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

      if (tier >= 3) {
        const engineRegex = /\/tier-list\/engines\/([^"]+)/gi;
        let engineMatch;
        while ((engineMatch = engineRegex.exec(sectionHtml)) !== null) {
          const deckName = decodeURIComponent(engineMatch[1]).trim() + " Engine";
          if (!seen.has(deckName)) {
            seen.add(deckName);
            decks.push({ deckName, tier, imageUrl: null });
          }
        }
      }
    }

    return decks;
  }
}
