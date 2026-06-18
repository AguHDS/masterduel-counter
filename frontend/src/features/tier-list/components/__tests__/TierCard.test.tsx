import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TierCard } from "../TierCard";
import type { TierListEntry } from "../../types/tierList.types";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/lib/utils/imageOptimization", () => ({
  getOptimizedCardImageUrl: (url: string | null) => url,
}));

function makeEntry(overrides: Partial<TierListEntry> = {}): TierListEntry {
  return {
    id: 1,
    deckName: "Test Deck",
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

  it("should display linkedArchetypeName when set", () => {
    const entry = makeEntry({ linkedArchetypeName: "HERO", deckName: "HEROs" });
    render(
      <MemoryRouter>
        <TierCard entry={entry} />
      </MemoryRouter>,
    );
    expect(screen.getByText("HERO")).toBeDefined();
    expect(screen.queryByText("HEROs")).toBeNull();
  });

  it("should display deckName when linkedArchetypeName is null", () => {
    const entry = makeEntry({ linkedArchetypeName: null, deckName: "Branded" });
    render(
      <MemoryRouter>
        <TierCard entry={entry} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Branded")).toBeDefined();
  });

  it("should navigate by slug when linkedArchetypeId is set", () => {
    const entry = makeEntry({ linkedArchetypeId: 42, linkedArchetypeName: "HERO" });
    render(
      <MemoryRouter>
        <TierCard entry={entry} />
      </MemoryRouter>,
    );

    const card = screen.getByText("HERO").closest("div[class*='cursor-pointer']") as HTMLElement;
    expect(card).toBeDefined();
    card.click();

    expect(mockNavigate).toHaveBeenCalledWith("/archetype/hero/deck-guides");
  });

  it("should navigate by slug when linkedArchetypeId is null", () => {
    const entry = makeEntry({ linkedArchetypeId: null, deckName: "Sky Striker" });
    render(
      <MemoryRouter>
        <TierCard entry={entry} />
      </MemoryRouter>,
    );

    const card = screen.getByText("Sky Striker").closest("div[class*='cursor-pointer']") as HTMLElement;
    expect(card).toBeDefined();
    card.click();

    expect(mockNavigate).toHaveBeenCalledWith("/archetype/sky-striker/deck-guides");
  });

  it("should display guide counts in correct colors", () => {
    const entry = makeEntry({ counterGuideCount: 7, deckGuideCount: 2 });
    render(
      <MemoryRouter>
        <TierCard entry={entry} />
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
        <TierCard entry={entry} />
      </MemoryRouter>,
    );

    const img = document.querySelector("img");
    expect(img).toBeNull();
  });
});
