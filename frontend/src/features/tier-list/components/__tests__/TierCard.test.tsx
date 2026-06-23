import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TierCard } from "../TierCard";
import type { TierListEntry } from "../../types/tierList.types";

vi.mock("@/lib/utils/imageOptimization", () => ({
  getOptimizedCardImageUrl: (url: string | null) => url,
}));

function makeEntry(overrides: Partial<TierListEntry> = {}): TierListEntry {
  return {
    id: 1,
    deckName: "Test Deck",
    displayName: null,
    tier: 1,
    format: "masterduel",
    position: 0,
    imageUrl: "http://example.com/card.jpg",
    source: "scraped",
    isActive: true,
    linkedArchetypeId: null,
    linkedArchetypeName: null,
    counterGuideCount: 3,
    deckGuideCount: 5,
    scrapedAt: null,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("TierCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display displayName when set", () => {
    const entry = makeEntry({ displayName: "HERO", deckName: "HEROs" });
    render(
      <MemoryRouter>
        <TierCard entry={entry} rank={1} />
      </MemoryRouter>,
    );
    expect(screen.getByText("HERO")).toBeDefined();
    expect(screen.queryByText("HEROs")).toBeNull();
  });

  it("should display deckName when displayName is null", () => {
    const entry = makeEntry({ displayName: null, deckName: "Branded" });
    render(
      <MemoryRouter>
        <TierCard entry={entry} rank={1} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Branded")).toBeDefined();
  });

  it("should link to linkedArchetypeName slug when set", () => {
    const entry = makeEntry({ linkedArchetypeId: 42, linkedArchetypeName: "HERO", deckName: "HEROs" });
    render(
      <MemoryRouter>
        <TierCard entry={entry} rank={1} />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link");
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/archetype/hero/deck-guides");
  });

  it("should link to deckName slug when no linkedArchetypeName", () => {
    const entry = makeEntry({ linkedArchetypeId: null, displayName: null, deckName: "Sky Striker" });
    render(
      <MemoryRouter>
        <TierCard entry={entry} rank={1} />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link");
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/archetype/sky-striker/deck-guides");
  });

  it("should display guide counts in correct colors", () => {
    const entry = makeEntry({ counterGuideCount: 7, deckGuideCount: 2 });
    render(
      <MemoryRouter>
        <TierCard entry={entry} rank={1} />
      </MemoryRouter>,
    );

    const counterEl = screen.getByText("Counter: 7");
    const deckEl = screen.getByText("Deck: 2");
    expect(counterEl).toBeDefined();
    expect(deckEl).toBeDefined();
    expect(counterEl.className).toContain("text-amber-600");
    expect(deckEl.className).toContain("text-cyan-400");
  });

  it("should show placeholder icon when imageUrl is null", () => {
    const entry = makeEntry({ imageUrl: null });
    render(
      <MemoryRouter>
        <TierCard entry={entry} rank={1} />
      </MemoryRouter>,
    );

    const img = document.querySelector("img");
    expect(img).toBeNull();
  });
});
