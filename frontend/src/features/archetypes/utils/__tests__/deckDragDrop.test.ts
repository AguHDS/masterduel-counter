import { describe, it, expect } from "vitest";
import { reorderCardsInZone } from "../deckDragDrop";

describe("reorderCardsInZone", () => {
  it("should move card from index 3 to index 0 (shift)", () => {
    const cards = ["A", "B", "C", "D"];
    const result = reorderCardsInZone(cards, 3, 0);

    expect(result).toEqual(["D", "A", "B", "C"]);
    expect(cards).toEqual(["A", "B", "C", "D"]);
  });

  it("should move card from index 0 to index 3 (shift)", () => {
    const cards = ["A", "B", "C", "D"];
    const result = reorderCardsInZone(cards, 0, 3);

    expect(result).toEqual(["B", "C", "D", "A"]);
  });

  it("should return same array when indices are equal", () => {
    const cards = ["A", "B", "C"];
    const result = reorderCardsInZone(cards, 1, 1);

    expect(result).toEqual(["A", "B", "C"]);
  });

  it("should return original when fromIndex is out of range (negative)", () => {
    const cards = ["A", "B"];
    const result = reorderCardsInZone(cards, -1, 0);

    expect(result).toBe(cards);
  });

  it("should return original when toIndex is out of range", () => {
    const cards = ["A", "B"];
    const result = reorderCardsInZone(cards, 0, 5);

    expect(result).toBe(cards);
  });

  it("should return original when fromIndex is out of range (too high)", () => {
    const cards = ["A", "B"];
    const result = reorderCardsInZone(cards, 2, 1);

    expect(result).toBe(cards);
  });

  it("should handle empty array", () => {
    const cards: string[] = [];
    const result = reorderCardsInZone(cards, 0, 0);

    expect(result).toEqual([]);
  });

  it("should move first card to last position", () => {
    const cards = [1, 2, 3, 4, 5];
    const result = reorderCardsInZone(cards, 0, 4);

    expect(result).toEqual([2, 3, 4, 5, 1]);
  });

  it("should not mutate the original array", () => {
    interface TestCard { id: number; name: string }
    const cards: TestCard[] = [
      { id: 1, name: "Blue-Eyes" },
      { id: 2, name: "Dark Magician" },
    ];
    const originalCopy = [...cards];

    const result = reorderCardsInZone(cards, 0, 1);

    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(1);
    expect(cards).toEqual(originalCopy);
  });
});
