import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/queryKeys";
import {
  fetchTierList,
  fetchTierListConfig,
  updateTierListConfig,
  triggerScrape,
  saveTierList,
} from "../api/tierListApi";

/** Public: fetch tier list with 5min stale time */
export function useTierList(format = "masterduel") {
  return useQuery({
    queryKey: queryKeys.tierList.entries(format),
    queryFn: () => fetchTierList(format),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTierListConfig(format = "masterduel") {
  return useQuery({
    queryKey: queryKeys.tierList.config(format),
    queryFn: () => fetchTierListConfig(format),
    staleTime: 60 * 1000,
  });
}

export function useToggleScraping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ format, enabled }: { format: string; enabled: boolean }) =>
      updateTierListConfig(format, enabled),
    onSuccess: (_, { format }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tierList.config(format) });
    },
  });
}

/** Admin: trigger scrape via POST /api/tier-list/scrape */
export function useTriggerScrape() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: triggerScrape,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tierList.all });
    },
  });
}

export function useSaveTierList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveTierList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tierList.all });
    },
  });
}

export function useTierListAdmin(format = "masterduel") {
  const entries = useTierList(format);
  const config = useTierListConfig(format);
  const toggleScraping = useToggleScraping();
  const triggerScrapeMutation = useTriggerScrape();
  const saveMutation = useSaveTierList();

  return {
    entries,
    config,
    toggleScraping,
    triggerScrape: triggerScrapeMutation,
    saveTierList: saveMutation,
    isSaving: saveMutation.isPending,
    isScraping: triggerScrapeMutation.isPending,
  };
}
