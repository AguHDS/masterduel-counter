import { TierListApplicationPort } from "@/application/ports/TierListApplicationPort.js";
import { TierListRepository } from "@/domain/ports/TierListRepository.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";
import { CardApiService } from "@/domain/ports/externalServices/CardApiService.js";
import { CardApplicationPort } from "@/application/ports/CardApplicationPort.js";
import { TierListEntry, TierListConfig, TierListSaveInput } from "@/domain/TierList.js";

export class TierListApplicationService implements TierListApplicationPort {
  constructor(
    private readonly tierListRepository: TierListRepository,
    private readonly cardRepository: CardRepository,
    private readonly cardApiService: CardApiService,
    private readonly cardApplicationService: CardApplicationPort,
  ) {}

  /** Get entries for tierlist puposes */
  async getEntries(format: string): Promise<TierListEntry[]> {
    const entries = await this.tierListRepository.getEntries(format);
    await this.tierListRepository.enrichWithGuideCounts(entries);
    return entries;
  }

  /** Get soft-deleted entries (admin restore) */
  async getInactiveEntries(format: string): Promise<TierListEntry[]> {
    return this.tierListRepository.getInactiveEntries(format);
  }

  /** Save tierlist for entry purposes */
  async saveEntries(format: string, input: TierListSaveInput): Promise<void> {
    await this.tierListRepository.saveEntries(format, input);
  }

  async updatePositions(format: string, positions: { id: number; position: number }[]): Promise<void> {
    await this.tierListRepository.updatePositions(format, positions);
  }

  async getConfig(format: string): Promise<TierListConfig | null> {
    return this.tierListRepository.getConfig(format);
  }

  async upsertConfig(format: string, scrapingEnabled: boolean): Promise<TierListConfig> {
    return this.tierListRepository.upsertConfig(format, scrapingEnabled);
  }

  /** Scrapes external source based on format, resolves images, syncs manual entries */
  async scrapeAndSave(format: string): Promise<TierListEntry[]> {
    let scraper;
    if (format === "tcg") {
      const { YgoMetaTcgScraper } = await import(
        "@/infrastructure/adapters/externalServices/YgoMetaTcgScraper.js"
      );
      scraper = new YgoMetaTcgScraper();
    } else if (format === "ocg") {
      const { YgoMetaOcgScraper } = await import(
        "@/infrastructure/adapters/externalServices/YgoMetaOcgScraper.js"
      );
      scraper = new YgoMetaOcgScraper();
    } else {
      const { MasterDuelMetaScraper } = await import(
        "@/infrastructure/adapters/externalServices/MasterDuelMetaScraper.js"
      );
      scraper = new MasterDuelMetaScraper();
    }
    const scrapedDecks = await scraper.scrapeTierList();

    const entries = [];

    for (let i = 0; i < scrapedDecks.length; i++) {
      const deck = scrapedDecks[i];
      let imageUrl = deck.imageUrl ?? null;

      if (!imageUrl) {
        imageUrl = await this.resolveImageForDeck(deck.deckName);
      }

      entries.push({
        deckName: deck.deckName,
        tier: deck.tier,
        format,
        position: i,
        imageUrl,
        imageManuallySet: false,
        imageOffsetY: 0,
        displayName: null,
        linkedArchetypeId: null,
        linkedArchetypeName: null,
      });
    }

    await this.tierListRepository.replaceScrapedEntries(format, entries);
    await this.tierListRepository.updateLastScrapedAt(format);

    return this.tierListRepository.getEntries(format);
  }

  /** Resolves a deck image: findCardsByArchetype -> selectCard (local)-> YGOProDeck API -> selectCard (hotlink save) */
  async resolveImageForDeck(deckName: string): Promise<string | null> {
    try {
      const parts = deckName.split(" ");
      const namesToTry = [deckName];
      if (parts.length > 1) {
        namesToTry.push(parts[0]);
      }

      for (const name of namesToTry) {
        const dbCards = await this.cardRepository.findCardsByArchetype(name);

        if (dbCards.length > 0) {
          const card = dbCards[0];
          try {
            const cardData = await this.cardApplicationService.selectCard(card.id);
            return cardData.imageUrlCropped;
          } catch {
            return card.imageUrlCropped;
          }
        }
      }

      for (const name of namesToTry) {
        const cards = await this.cardApiService.searchCardByNameFromExternalApi(name);

        if (cards.length > 0) {
          const firstCard = cards[0];
          try {
            const cardData = await this.cardApplicationService.selectCard(firstCard.id);
            return cardData.imageUrlCropped;
          } catch {
            const images = firstCard.card_images as Array<{ image_url_cropped?: string }> | undefined;
            if (images && images.length > 0 && images[0].image_url_cropped) {
              return images[0].image_url_cropped;
            }
          }
        }
      }

      return null;
    } catch (err) {
      console.error(`[TierList] Image resolution error for "${deckName}":`, err instanceof Error ? err.message : err);
      return null;
    }
  }
}
