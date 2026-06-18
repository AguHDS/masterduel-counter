export interface TierListEntry {
  id: number;
  deckName: string;
  tier: number;
  format: string;
  position: number;
  imageUrl: string | null;
  source: "scraped" | "manual";
  isActive: boolean;
  linkedArchetypeId: number | null;
  linkedArchetypeName: string | null;
  counterGuideCount: number;
  deckGuideCount: number;
  scrapedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TierListConfig {
  id: number;
  format: string;
  scrapingEnabled: boolean;
  lastScrapedAt: string | null;
  updatedAt: string;
}

export interface TierListSaveInput {
  entries: {
    id?: number;
    deckName: string;
    tier: number;
    position: number;
    imageUrl: string | null;
    source: "scraped" | "manual";
    linkedArchetypeId?: number | null;
    linkedArchetypeName?: string | null;
  }[];
}
