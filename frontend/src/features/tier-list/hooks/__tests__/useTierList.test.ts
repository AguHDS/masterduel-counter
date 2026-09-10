import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTierList, useTierListConfig, useToggleScraping, useTriggerScrape, useSaveTierList, useTierListAdmin } from "../useTierList";

const mockFetchTierList = vi.fn();
const mockFetchTierListConfig = vi.fn();
const mockUpdateTierListConfig = vi.fn();
const mockTriggerScrape = vi.fn();
const mockSaveTierList = vi.fn();

vi.mock("../../api/tierListApi", () => ({
  fetchTierList: (...args: unknown[]) => mockFetchTierList(...args),
  fetchTierListConfig: (...args: unknown[]) => mockFetchTierListConfig(...args),
  updateTierListConfig: (...args: unknown[]) => mockUpdateTierListConfig(...args),
  triggerScrape: (...args: unknown[]) => mockTriggerScrape(...args),
  saveTierList: (...args: unknown[]) => mockSaveTierList(...args),
}));

import { createElement } from "react";

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

const sampleEntries = [
  { id: 1, deckName: "Deck A", tier: 1, format: "masterduel", position: 0, imageUrl: null, imageOffsetY: 0, source: "scraped" as const, isActive: true, linkedArchetypeId: null, linkedArchetypeName: null, counterGuideCount: 2, deckGuideCount: 1, scrapedAt: null, createdAt: "", updatedAt: "" },
  { id: 2, deckName: "Deck B", tier: 2, format: "masterduel", position: 0, imageUrl: null, imageOffsetY: 0, source: "manual" as const, isActive: true, linkedArchetypeId: 5, linkedArchetypeName: "HERO", counterGuideCount: 0, deckGuideCount: 3, scrapedAt: null, createdAt: "", updatedAt: "" },
];

const sampleConfig = { id: 1, format: "masterduel", scrapingEnabled: true, lastScrapedAt: null, updatedAt: "" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useTierList", () => {
  it("should call fetchTierList with format and return entries", async () => {
    mockFetchTierList.mockResolvedValueOnce(sampleEntries);

    const { result } = renderHook(() => useTierList("masterduel"), { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchTierList).toHaveBeenCalledWith("masterduel");
    expect(result.current.data).toEqual(sampleEntries);
  });

  it("should default format to masterduel", async () => {
    mockFetchTierList.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTierList(), { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchTierList).toHaveBeenCalledWith("masterduel");
  });
});

describe("useTierListConfig", () => {
  it("should call fetchTierListConfig and return config", async () => {
    mockFetchTierListConfig.mockResolvedValueOnce(sampleConfig);

    const { result } = renderHook(() => useTierListConfig("tcg"), { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchTierListConfig).toHaveBeenCalledWith("tcg");
    expect(result.current.data).toEqual(sampleConfig);
  });
});

describe("useToggleScraping", () => {
  it("should call updateTierListConfig and invalidate config query", async () => {
    mockUpdateTierListConfig.mockResolvedValueOnce(sampleConfig);
    mockFetchTierListConfig.mockResolvedValueOnce(sampleConfig);

    const { result } = renderHook(
      () => {
        const toggle = useToggleScraping();
        const config = useTierListConfig("masterduel");
        return { toggle, config };
      },
      { wrapper: Wrapper },
    );

    await vi.waitFor(() => {
      expect(result.current.config.isSuccess).toBe(true);
    });

    const callCountBefore = mockFetchTierListConfig.mock.calls.length;

    await act(async () => {
      await result.current.toggle.mutateAsync({ format: "masterduel", enabled: false });
    });

    expect(mockUpdateTierListConfig).toHaveBeenCalledWith("masterduel", false);
    // Should invalidate and refetch config
    await vi.waitFor(() => {
      expect(mockFetchTierListConfig.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });
});

describe("useTriggerScrape", () => {
  it("should call triggerScrape and invalidate all tier list queries", async () => {
    mockTriggerScrape.mockResolvedValueOnce(sampleEntries);
    mockFetchTierList.mockResolvedValueOnce(sampleEntries);

    const { result } = renderHook(
      () => {
        const scrape = useTriggerScrape("tcg");
        const entries = useTierList("tcg");
        return { scrape, entries };
      },
      { wrapper: Wrapper },
    );

    await vi.waitFor(() => {
      expect(result.current.entries.isSuccess).toBe(true);
    });

    const callCountBefore = mockFetchTierList.mock.calls.length;

    await act(async () => {
      await result.current.scrape.mutateAsync();
    });

    expect(mockTriggerScrape).toHaveBeenCalledWith("tcg");
    await vi.waitFor(() => {
      expect(mockFetchTierList.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });
});

describe("useSaveTierList", () => {
  it("should call saveTierList and invalidate all tier list queries", async () => {
    const input = { format: "masterduel", entries: [{ deckName: "New", tier: 1, position: 0, imageUrl: null, imageOffsetY: 0, source: "manual" as const }] };
    mockSaveTierList.mockResolvedValueOnce(sampleEntries);
    mockFetchTierList.mockResolvedValueOnce(sampleEntries);

    const { result } = renderHook(
      () => {
        const save = useSaveTierList();
        const entries = useTierList("masterduel");
        return { save, entries };
      },
      { wrapper: Wrapper },
    );

    await vi.waitFor(() => {
      expect(result.current.entries.isSuccess).toBe(true);
    });

    const callCountBefore = mockFetchTierList.mock.calls.length;

    await act(async () => {
      await result.current.save.mutateAsync(input);
    });

    expect(mockSaveTierList).toHaveBeenCalled();
    expect(mockSaveTierList.mock.calls[0][0]).toEqual(input);
    await vi.waitFor(() => {
      expect(mockFetchTierList.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });
});

describe("useTierListAdmin", () => {
  it("should compose sub-hooks and expose isSaving/isScraping", async () => {
    mockFetchTierList.mockResolvedValueOnce(sampleEntries);
    mockFetchTierListConfig.mockResolvedValueOnce(sampleConfig);

    const { result } = renderHook(() => useTierListAdmin("masterduel"), { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(result.current.entries.isSuccess).toBe(true);
    });

    expect(result.current.entries.data).toEqual(sampleEntries);
    expect(result.current.config.data).toEqual(sampleConfig);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.isScraping).toBe(false);
    expect(typeof result.current.toggleScraping.mutate).toBe("function");
    expect(typeof result.current.triggerScrape.mutate).toBe("function");
    expect(typeof result.current.saveTierList.mutate).toBe("function");
  });
});
