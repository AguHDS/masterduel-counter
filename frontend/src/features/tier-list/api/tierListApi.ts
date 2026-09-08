import { axiosClient } from "@/lib/http/axiosClient";
import type {
  TierListEntry,
  TierListConfig,
  TierListResponse,
  TierListConfigResponse,
  TierListSaveInput,
  TierListSaveResponse,
  TierListReorderInput,
} from "../types/tierList.types";

/** Public: fetch tier list entries for display */
export const fetchTierList = async (format = "masterduel"): Promise<TierListEntry[]> => {
  const res = await axiosClient.get<TierListResponse>("/api/tier-list", {
    params: { format },
  });
  return res.data.entries ?? [];
};

/** Admin: fetch soft-deleted (inactive) entries for restore */
export const fetchInactiveTierList = async (format = "masterduel"): Promise<TierListEntry[]> => {
  const res = await axiosClient.get<TierListResponse>("/api/tier-list/inactive", {
    params: { format },
  });
  return res.data.entries ?? [];
};

export const fetchTierListConfig = async (format = "masterduel"): Promise<TierListConfig | null> => {
  const res = await axiosClient.get<TierListConfigResponse>("/api/tier-list/config", {
    params: { format },
  });
  return res.data.config ?? null;
};

export const updateTierListConfig = async (
  format: string,
  scrapingEnabled: boolean,
): Promise<TierListConfig> => {
  const res = await axiosClient.put<TierListConfigResponse>("/api/tier-list/config", {
    format,
    scrapingEnabled,
  });
  return res.data.config!;
};

/** Admin: trigger a full scrape (fetch + parse + save images) */
export const triggerScrape = async (format = "masterduel"): Promise<TierListEntry[]> => {
  const res = await axiosClient.post<TierListResponse>("/api/tier-list/scrape", { format });
  return res.data.entries ?? [];
};

export const saveTierList = async (input: TierListSaveInput): Promise<TierListEntry[]> => {
  const res = await axiosClient.post<TierListSaveResponse>("/api/tier-list/save", input);
  return res.data.entries ?? [];
};

export const reorderTierList = async (input: TierListReorderInput): Promise<void> => {
  await axiosClient.put("/api/tier-list/entries/reorder", input);
};
