import { describe, it, expect } from "vitest";
import { normalizeFavoriteDeckSlots } from "../../hooks/useFavoriteCardAndDecks";

const SIX_NULLS = [null, null, null, null, null, null];

describe("normalizeFavoriteDeckSlots", () => {
  it("should return 6 nulls for non-array input", () => {
    expect(normalizeFavoriteDeckSlots(null)).toEqual(SIX_NULLS);
    expect(normalizeFavoriteDeckSlots(undefined)).toEqual(SIX_NULLS);
    expect(normalizeFavoriteDeckSlots("not-an-array")).toEqual(SIX_NULLS);
  });

  it("should return 6 nulls for empty array", () => {
    expect(normalizeFavoriteDeckSlots([])).toEqual(SIX_NULLS);
  });

  it("should normalize valid deck entries", () => {
    const result = normalizeFavoriteDeckSlots([
      { deckId: 1 },
      { deckId: 2 },
    ]);

    expect(result).toEqual([
      { deckId: 1 },
      { deckId: 2 },
      null, null, null, null,
    ]);
  });

  it("should truncate to 6 entries max", () => {
    const result = normalizeFavoriteDeckSlots(
      Array.from({ length: 8 }, (_, i) => ({ deckId: i + 1 })),
    );

    expect(result.length).toBe(6);
    expect(result[5]).toEqual({ deckId: 6 });
  });

  it("should ignore entries with invalid deckId (string)", () => {
    const result = normalizeFavoriteDeckSlots([
      { deckId: "abc" },
      { deckId: 1 },
    ]);

    expect(result).toEqual([
      null,
      { deckId: 1 },
      null, null, null, null,
    ]);
  });

  it("should ignore entries with deckId = 0", () => {
    const result = normalizeFavoriteDeckSlots([
      { deckId: 0 },
      { deckId: 1 },
    ]);

    expect(result).toEqual([
      null,
      { deckId: 1 },
      null, null, null, null,
    ]);
  });

  it("should ignore entries with negative deckId", () => {
    const result = normalizeFavoriteDeckSlots([
      { deckId: -1 },
      { deckId: 1 },
    ]);

    expect(result).toEqual([
      null,
      { deckId: 1 },
      null, null, null, null,
    ]);
  });

  it("should ignore entries missing deckId property", () => {
    const result = normalizeFavoriteDeckSlots([
      { name: "test" },
      { deckId: 1 },
    ]);

    expect(result).toEqual([
      null,
      { deckId: 1 },
      null, null, null, null,
    ]);
  });

  it("should ignore null entries in the input array", () => {
    const result = normalizeFavoriteDeckSlots([
      null,
      { deckId: 1 },
      null,
      { deckId: 2 },
    ]);

    expect(result).toEqual([
      null,
      { deckId: 1 },
      null,
      { deckId: 2 },
      null, null,
    ]);
  });
});
