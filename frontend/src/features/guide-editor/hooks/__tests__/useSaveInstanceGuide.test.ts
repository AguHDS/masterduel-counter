import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Card, GuideType } from "@/features/archetypes/types";

// Mock modules used by useSaveInstanceGuide
const mockMutateAsync = vi.fn().mockResolvedValue({ instance: { id: 42 } });

vi.mock("../useArchetypeQueries", () => ({
  useSaveGuide: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/features/archetypes/api/archetypesApi", () => ({
  confirmCards: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../api/guideEditorApi", () => ({
  saveRecommendedDeck: vi.fn().mockResolvedValue(undefined),
  deleteRecommendedDeck: vi.fn().mockResolvedValue(undefined),
}));

import { useSaveInstanceGuide } from "../useSaveInstanceGuide";

function makeCard(id = 1): Card {
  return {
    id,
    name: `Card ${id}`,
    imageUrl: `http://loc/${id}.jpg`,
    imageUrlSmall: `http://loc/${id}s.jpg`,
    imageUrlCropped: `http://loc/${id}c.jpg`,
  };
}

function makeHeaderCard() {
  return { id: 1, name: "Header", imageUrl: "http://loc/h.jpg", imageUrlSmall: "http://loc/hs.jpg", imageUrlCropped: "http://loc/hc.jpg" };
}

const VALID_PAIRS = [
  {
    id: "p1",
    section: "HANDTRAP" as const,
    topCards: [makeCard(10)],
    bottomCards: [],
    comment: undefined as string | undefined,
  },
];

type SaveParamsOverrides = {
  pairs?: typeof VALID_PAIRS;
  initialHands?: { id: string; cards: Card[]; description?: string }[];
  guideType?: GuideType;
  title?: string;
  headerCard?: ReturnType<typeof makeHeaderCard> | null;
  hasDeckContent?: boolean;
};

function makeSaveParams(overrides: SaveParamsOverrides = {}) {
  return {
    pairs: overrides.pairs ?? VALID_PAIRS,
    initialHands: overrides.initialHands ?? [],
    guideType: (overrides.guideType ?? "COUNTER") as GuideType,
    title: overrides.title ?? "Test Guide",
    generalTip: "",
    headerCard: overrides.headerCard !== undefined ? overrides.headerCard : makeHeaderCard(),
    archetypeId: 1,
    archetypeName: "Test",
    deckTitle: "My Deck",
    deckMainCards: [] as Card[],
    deckExtraCards: [] as Card[],
    deckSideCards: [] as Card[],
    hasDeckContent: overrides.hasDeckContent ?? false,
    existingDeck: false,
  };
}

describe("useSaveInstanceGuide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  afterAll(() => {
    // Restore is handled by vitest dom cleanup
  });

  it("should set validationError for empty COUNTER pairs", () => {
    const { result } = renderHook(() => useSaveInstanceGuide());

    act(() => {
      result.current.saveInstance(
        makeSaveParams({ pairs: [], guideType: "COUNTER" }),
      );
    });

    expect(result.current.validationError).not.toBeNull();
    expect(result.current.validationError).toMatch(/at least one card pair/i);
  });

  it("should set validationError for empty DECK hands without deck", () => {
    const { result } = renderHook(() => useSaveInstanceGuide());

    act(() => {
      result.current.saveInstance(
        makeSaveParams({
          initialHands: [],
          guideType: "DECK",
          hasDeckContent: false,
        }),
      );
    });

    expect(result.current.validationError).not.toBeNull();
    expect(result.current.validationError).toMatch(/at least one initial hand/i);
  });

  it("should throw when header card is missing", async () => {
    const { result } = renderHook(() => useSaveInstanceGuide());

    await expect(
      act(() => result.current.saveInstance(
        makeSaveParams({ headerCard: null }),
      )),
    ).rejects.toThrow(/header card/i);
  });

  it("should call saveMutation on valid COUNTER save", async () => {
    const { result } = renderHook(() => useSaveInstanceGuide());

    await act(async () => {
      await result.current.saveInstance(makeSaveParams());
    });

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        archetypeId: 1,
        guideType: "COUNTER",
        title: "Test Guide",
      }),
    );
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });

  it("should clear validationError", () => {
    const { result } = renderHook(() => useSaveInstanceGuide());

    act(() => {
      result.current.saveInstance(makeSaveParams({ pairs: [], guideType: "COUNTER" }));
    });

    expect(result.current.validationError).not.toBeNull();

    act(() => {
      result.current.clearValidationError();
    });

    expect(result.current.validationError).toBeNull();
  });
});
