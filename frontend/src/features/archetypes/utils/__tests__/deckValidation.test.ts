import { describe, it, expect } from "vitest";
import { validateDeckCardAddition } from "../deckValidation";

function makeCard(id: number) {
  return { id, name: `Card ${id}` };
}

describe("validateDeckCardAddition", () => {
  it("should allow a new card when deck is empty", () => {
    const result = validateDeckCardAddition({
      card: makeCard(1),
      targetZone: "main",
      mainDeck: [],
      extraDeck: [],
    });

    expect(result).toBeNull();
  });

  it("should reject when 3 copies already exist", () => {
    const result = validateDeckCardAddition({
      card: makeCard(1),
      targetZone: "main",
      mainDeck: [makeCard(1)],
      extraDeck: [makeCard(1), makeCard(1)],
    });

    expect(result).not.toBeNull();
    expect(result!.code).toBe("MAX_COPIES");
    expect(result!.message).toContain("maximum of 3 copies");
  });

  it("should allow when copies exist but less than 3", () => {
    const result = validateDeckCardAddition({
      card: makeCard(1),
      targetZone: "main",
      mainDeck: [makeCard(1)],
      extraDeck: [makeCard(1)],
      sideDeck: [],
    });

    expect(result).toBeNull();
  });

  it("should reject when main deck is full (60 cards)", () => {
    const mainDeck = Array.from({ length: 60 }, (_, i) => makeCard(i + 10));

    const result = validateDeckCardAddition({
      card: makeCard(1),
      targetZone: "main",
      mainDeck,
      extraDeck: [],
    });

    expect(result).not.toBeNull();
    expect(result!.code).toBe("ZONE_LIMIT");
    expect(result!.message).toContain("Main deck cannot have more than 60");
  });

  it("should reject when extra deck is full (15 cards)", () => {
    const extraDeck = Array.from({ length: 15 }, (_, i) => makeCard(i + 10));

    const result = validateDeckCardAddition({
      card: makeCard(1),
      targetZone: "extra",
      mainDeck: [],
      extraDeck,
    });

    expect(result).not.toBeNull();
    expect(result!.code).toBe("ZONE_LIMIT");
    expect(result!.message).toContain("Extra deck cannot have more than 15");
  });

  it("should reject when side deck is full (20 cards)", () => {
    const sideDeck = Array.from({ length: 20 }, (_, i) => makeCard(i + 10));

    const result = validateDeckCardAddition({
      card: makeCard(1),
      targetZone: "side",
      mainDeck: [],
      extraDeck: [],
      sideDeck,
    });

    expect(result).not.toBeNull();
    expect(result!.code).toBe("ZONE_LIMIT");
    expect(result!.message).toContain("Side deck cannot have more than 20");
  });

  it("should count copies across all zones (main + extra + side)", () => {
    const result = validateDeckCardAddition({
      card: makeCard(1),
      targetZone: "side",
      mainDeck: [makeCard(1)],
      extraDeck: [makeCard(1)],
      sideDeck: [makeCard(1)],
    });

    expect(result).not.toBeNull();
    expect(result!.code).toBe("MAX_COPIES");
  });
});
