import { TierListEntry, TierListConfig, TierListSaveInput } from "@/domain/TierList.js";

// Data-access contract for tier list entries and config
export interface TierListRepository {
  getEntries(format: string): Promise<TierListEntry[]>;
  /** Full replacement used by admin bulk-save (DELETE all + INSERT all) */
  saveEntries(format: string, input: TierListSaveInput): Promise<void>;
  updatePositions(format: string, positions: { id: number; position: number }[]): Promise<void>;
  getConfig(format: string): Promise<TierListConfig | null>;
  upsertConfig(format: string, scrapingEnabled: boolean): Promise<TierListConfig>;
  updateLastScrapedAt(format: string): Promise<void>;
  /** Scrape-time merge: deletes scraped entries, updates manual entries' tiers, removes fallen manual entries */
  replaceScrapedEntries(format: string, entries: Omit<TierListEntry, "id" | "createdAt" | "updatedAt" | "isActive" | "source" | "scrapedAt" | "counterGuideCount" | "deckGuideCount">[]): Promise<void>;
  /** Get guide counts of guide types (counter & deck) to display in each item of the tierlist */
  enrichWithGuideCounts(entries: TierListEntry[]): Promise<void>;
  /** Cascade rename: update linked_archetype_name for all entries linked to an archetype */
  updateLinkedArchetypeName(archetypeId: number, newName: string): Promise<void>;
}
