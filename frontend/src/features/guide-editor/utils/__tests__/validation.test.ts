import { describe, it, expect } from "vitest";
import { validateInstanceData, transformPairsForApi } from "../validation";
import type { CardPair } from "@/features/archetypes/types";

function makePair(overrides: Partial<CardPair> = {}): CardPair {
  return {
    id: "pair-1",
    section: "HANDTRAP",
    topCards: [],
    bottomCards: [],
    ...overrides,
  };
}

function makeCard(id = 1) {
  return {
    id,
    name: "Test Card",
    imageUrl: "http://loc/c.jpg",
    imageUrlSmall: "http://loc/cs.jpg",
    imageUrlCropped: "http://loc/cc.jpg",
  };
}

function makeHeaderCard(id = 1) {
  return { id, name: "Header", imageUrl: "http://loc/h.jpg" };
}

describe("validateInstanceData", () => {
  it("should pass for valid COUNTER pairs", () => {
    const pairs = [makePair({ topCards: [makeCard()] })];
    const result = validateInstanceData(pairs, makeHeaderCard(), "Test Title", "COUNTER");

    expect(result.isValid).toBe(true);
  });

  it("should fail when no header card is provided", () => {
    const pairs = [makePair({ topCards: [makeCard()] })];
    const result = validateInstanceData(pairs, null, "Test Title");

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/header card/i);
  });

  it("should fail when title is empty", () => {
    const result = validateInstanceData([], makeHeaderCard(), "   ");

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/title/i);
  });

  it("should fail when COUNTER guide has empty pairs array", () => {
    const result = validateInstanceData([], makeHeaderCard(), "Title", "COUNTER");

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/at least one card pair/i);
  });

  it("should fail when all pairs are empty", () => {
    const pairs = [makePair()];
    const result = validateInstanceData(pairs, makeHeaderCard(), "Title", "COUNTER");

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/at least one card/i);
  });

  it("should pass for DECK guide without pairs", () => {
    const result = validateInstanceData([], makeHeaderCard(), "Deck Title", "DECK");

    expect(result.isValid).toBe(true);
  });
});

describe("transformPairsForApi", () => {
  it("should transform pairs to API DTO format", () => {
    const pairs = [
      makePair({
        topCards: [makeCard(1), makeCard(2)],
        bottomCards: [makeCard(3)],
        section: "BOARD_BREAKER",
        comment: "Test comment",
      }),
    ];

    const result = transformPairsForApi(pairs);

    expect(result).toHaveLength(1);
    expect(result[0].topCardIds).toEqual([1, 2]);
    expect(result[0].bottomCardIds).toHaveLength(1);
    expect(result[0].bottomCardIds[0].cardId).toBe(3);
    expect(result[0].pairSection).toBe("BOARD_BREAKER");
    expect(result[0].comment).toBe("Test comment");
  });

  it("should default section to HANDTRAP for non-BOARD_BREAKER", () => {
    const pairs = [makePair({ section: "HANDTRAP" })];

    const result = transformPairsForApi(pairs);

    expect(result[0].pairSection).toBe("HANDTRAP");
  });
});
