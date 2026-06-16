import { TierListEntry, TierListConfig, TierListSaveInput } from "@/domain/TierList.js";

export interface TierListApplicationPort {
  /** Get entries for tierlist */
  getEntries(format: string): Promise<TierListEntry[]>;
  /** Save entries for tierlist */
  saveEntries(format: string, input: TierListSaveInput): Promise<void>;
  /** Update positions for tierlist */
  updatePositions(format: string, positions: { id: number; position: number }[]): Promise<void>;
  /** Get the config for the tierlist */
  getConfig(format: string): Promise<TierListConfig | null>;
  /** Upsert Config */
  upsertConfig(format: string, scrapingEnabled: boolean): Promise<TierListConfig>;
  /** Scrape masterduelmeta.com, resolve images via DB+selectCard, sync manual entries */
  scrapeAndSave(format: string): Promise<TierListEntry[]>;
}
