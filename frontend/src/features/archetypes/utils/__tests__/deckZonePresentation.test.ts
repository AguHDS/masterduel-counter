import { describe, it, expect } from "vitest";
import { getDeckZoneLabel, DECK_ZONE_LIMITS } from "../deckZonePresentation";

describe("getDeckZoneLabel", () => {
  it("should return 'Main Deck' for main zone", () => {
    expect(getDeckZoneLabel("main")).toBe("Main Deck");
  });

  it("should return 'Extra Deck' for extra zone", () => {
    expect(getDeckZoneLabel("extra")).toBe("Extra Deck");
  });

  it("should return 'Side Deck' for side zone", () => {
    expect(getDeckZoneLabel("side")).toBe("Side Deck");
  });
});

describe("DECK_ZONE_LIMITS", () => {
  it("should have correct limits for each zone", () => {
    expect(DECK_ZONE_LIMITS.main).toBe(60);
    expect(DECK_ZONE_LIMITS.extra).toBe(15);
    expect(DECK_ZONE_LIMITS.side).toBe(20);
  });
});
