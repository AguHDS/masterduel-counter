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

  /**
   * Parses the `tier-img-container` sections. Each container = one tier (T1, T2, ...). Engines are
   * only included from tier 3 onward. The last container region extends to the end of the page,
   * which is where MDM renders the trending/long-tail decks (that becomes the bottom tier, T4).
   */
  private parseTierList(html: string): ScrapedDeck[] {
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
