import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeckManagement } from "../deck-guides/useDeckManagement";
import type { Card } from "@/features/archetypes/types";

function makeCard(id = 1): Card {
  return {
    id,
    name: `Card ${id}`,
    imageUrl: `http://loc/${id}.jpg`,
    imageUrlSmall: `http://loc/${id}s.jpg`,
    imageUrlCropped: `http://loc/${id}c.jpg`,
  };
}

function makeDeck(params: {
  title?: string;
  main?: Card[];
  extra?: Card[];
  side?: Card[];
} = {}) {
  return {
    title: params.title ?? "Test Deck",
    mainDeck: params.main ?? [],
    extraDeck: params.extra ?? [],
    sideDeck: params.side ?? [],
  };
}

describe("useDeckManagement", () => {
  it("should initialize with empty deck", () => {
    const { result } = renderHook(() =>
      useDeckManagement({
        recommendedDeck: {
          deck: null,
          deleteRecommendedDeck: async () => {},
        },
        isEditMode: false,
        isOwner: false,
      }),
    );

    expect(result.current.deckTitle).toBe("Recommended Deck");
    expect(result.current.deckMainCards).toEqual([]);
    expect(result.current.showRecommendedDeck).toBe(false);
  });

  it("should save original state when entering edit mode", () => {
    const mainDeck = [makeCard(1)];
    const deck = makeDeck({ main: mainDeck });

    const { result, rerender } = renderHook(
      ({ isEditMode }) =>
        useDeckManagement({
          recommendedDeck: { deck, deleteRecommendedDeck: async () => {} },
          isEditMode,
          isOwner: true,
        }),
      { initialProps: { isEditMode: false } },
    );

    // Enter edit mode
    rerender({ isEditMode: true });

    expect(result.current.originalDeckState).not.toBeNull();
    expect(result.current.originalDeckState!.mainCards).toEqual(mainDeck);
    expect(result.current.originalDeckState!.exists).toBe(true);
  });

  it("should clear original state when exiting edit mode", () => {
    const deck = makeDeck({ main: [makeCard(1)] });

    const { result, rerender } = renderHook(
      ({ isEditMode }) =>
        useDeckManagement({
          recommendedDeck: { deck, deleteRecommendedDeck: async () => {} },
          isEditMode,
          isOwner: true,
        }),
      { initialProps: { isEditMode: false } },
    );

    // Enter edit mode to set original state
    rerender({ isEditMode: true });
    expect(result.current.originalDeckState).not.toBeNull();

    // Exit edit mode (simulating save)
    rerender({ isEditMode: false });
    expect(result.current.originalDeckState).toBeNull();
  });

  it("should hide deck locally on delete in edit mode", async () => {
    const deck = makeDeck({ main: [makeCard()] });

    const { result } = renderHook(() =>
      useDeckManagement({
        recommendedDeck: { deck, deleteRecommendedDeck: async () => {} },
        isEditMode: true,
        isOwner: true,
      }),
    );

    // Initially shown (auto-show effect)
    expect(result.current.showRecommendedDeck).toBe(true);

    await act(async () => {
      await result.current.handleDeleteDeck();
    });

    expect(result.current.showRecommendedDeck).toBe(false);
    expect(result.current.deckMainCards).toEqual([]);
  });
});
