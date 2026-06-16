import { TierListEntry, TierListConfig, TierListSaveInput } from "@/domain/TierList.js";

export interface TierListApplicationPort {
  getEntries(format: string): Promise<TierListEntry[]>;
  saveEntries(format: string, input: TierListSaveInput): Promise<void>;
  updatePositions(format: string, positions: { id: number; position: number }[]): Promise<void>;
  getConfig(format: string): Promise<TierListConfig | null>;
  upsertConfig(format: string, scrapingEnabled: boolean): Promise<TierListConfig>;
  scrapeAndSave(format: string): Promise<TierListEntry[]>;
}
