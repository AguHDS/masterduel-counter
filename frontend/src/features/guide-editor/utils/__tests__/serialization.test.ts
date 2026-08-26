import { describe, it, expect } from "vitest";
import { isFinalBoardEmpty, serializeFinalBoard, collectGuideCardIds } from "../serialization";
import type { InitialHand } from "../../components/deck-guides/InitialHandsEditor";

function makeCard(id = 1) {
  return {
    id,
    name: `Card ${id}`,
    imageUrl: "http://loc/c.jpg",
    imageUrlSmall: "http://loc/cs.jpg",
    imageUrlCropped: "http://loc/cc.jpg",
  };
}

function makeHand(overrides: Partial<InitialHand> = {}): InitialHand {
  return {
    id: "hand-1",
    cards: [makeCard(1)],
    ...overrides,
  };
}

describe("isFinalBoardEmpty", () => {
  it("should return true for hand without finalBoard", () => {
    expect(isFinalBoardEmpty(makeHand())).toBe(true);
  });

  it("should return false when board has a monster", () => {
    const hand = makeHand({
      finalBoard: {
        id: "board-1",
        fieldSpell: null,
        extraMonsters: [null, null],
        monsters: [makeCard(1), null, null, null, null],
        spellTraps: [null, null, null, null, null],
        hand: [null, null, null, null, null],
        graveyard: [],
        banished: [],
        extraDeck: [],
        description: "",
        monsterPositions: ["atk", "atk", "atk", "atk", "atk"],
        extraMonsterPositions: ["atk", "atk"],
      },
    });
    expect(isFinalBoardEmpty(hand)).toBe(false);
  });
});

describe("serializeFinalBoard", () => {
  it("should return undefined for empty board", () => {
    expect(serializeFinalBoard(makeHand())).toBeUndefined();
  });

  it("should serialize a board with monsters", () => {
    const hand = makeHand({
      finalBoard: {
        id: "board-2",
        fieldSpell: null,
        extraMonsters: [null, null],
        monsters: [makeCard(5), null, null, null, null],
        spellTraps: [null, null, null, null, null],
        hand: [null, null, null, null, null],
        graveyard: [makeCard(2)],
        banished: [],
        extraDeck: [],
        description: "Best board ever",
        monsterPositions: ["atk", "atk", "atk", "atk", "atk"],
        extraMonsterPositions: ["atk", "atk"],
      },
    });

    const result = serializeFinalBoard(hand);

    expect(result).toBeDefined();
    expect(result!.monsterCardIds[0]).toBe(5);
    expect(result!.graveyardCardIds).toEqual([2]);
    expect(result!.description).toBe("Best board ever");
  });

  it("should handle null cards in zones", () => {
    const hand = makeHand({
      finalBoard: {
        id: "board-3",
        fieldSpell: null,
        extraMonsters: [null, null],
        monsters: [null, null, null, null, null],
        spellTraps: [null, null, null, null, null],
        hand: [null, null, null, null, null],
        graveyard: [],
        banished: [],
        extraDeck: [],
        description: "",
        monsterPositions: ["atk", "atk", "atk", "atk", "atk"],
        extraMonsterPositions: ["atk", "atk"],
      },
    });

    const result = serializeFinalBoard(hand);

    expect(result).toBeUndefined();
  });
});

describe("collectGuideCardIds", () => {
  it("should collect and deduplicate card IDs", () => {
    const ids = collectGuideCardIds({
      headerCardId: 1,
      cardPairIds: [[2, 3, 2]],
      deckCardIds: [1, 4],
    });

    expect(ids).toHaveLength(4);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
    expect(ids).toContain(3);
    expect(ids).toContain(4);
  });

  it("should return empty array when no IDs provided", () => {
    const ids = collectGuideCardIds({});

    expect(ids).toEqual([]);
  });

  it("should handle all optional params", () => {
    const ids = collectGuideCardIds({
      headerCardId: 10,
      initialHandCardIds: [[11, 12]],
      comboStepCardIds: [[13]],
      deckCardIds: [14, 15],
    });

    expect(ids).toContain(10);
    expect(ids).toContain(11);
    expect(ids).toContain(15);
  });
});
