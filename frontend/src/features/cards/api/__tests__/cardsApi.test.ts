import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchCardsWithPagination } from "../cardsApi";
import type { Card } from "../../types";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("@/lib/http", () => ({
  axiosClient: { get: mockGet },
}));

function makeCard(id: number): Card {
  return { id, name: `Card ${id}` };
}

describe("searchCardsWithPagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated results for a single page", async () => {
    const cards = Array.from({ length: 30 }, (_, i) => makeCard(i + 1));
    mockGet.mockResolvedValueOnce({ data: { results: cards } });

    const result = await searchCardsWithPagination({ query: "Blue", page: 1, limit: 30 });

    expect(result.cards.length).toBe(30);
    expect(result.total).toBe(30);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.cards[0].id).toBe(1);
    expect(result.cards[29].id).toBe(30);
  });

  it("should return correct slice for middle page", async () => {
    const cards = Array.from({ length: 90 }, (_, i) => makeCard(i + 1));
    mockGet.mockResolvedValueOnce({ data: { results: cards } });

    const result = await searchCardsWithPagination({ query: "Eyes", page: 2, limit: 30 });

    expect(result.cards.length).toBe(30);
    expect(result.total).toBe(90);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(2);
    expect(result.cards[0].id).toBe(31);
    expect(result.cards[29].id).toBe(60);
  });

  it("should return remaining cards on last partial page", async () => {
    const cards = Array.from({ length: 65 }, (_, i) => makeCard(i + 1));
    mockGet.mockResolvedValueOnce({ data: { results: cards } });

    const result = await searchCardsWithPagination({ query: "Dragon", page: 3, limit: 30 });

    expect(result.cards.length).toBe(5);
    expect(result.total).toBe(65);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(3);
  });

  it("should return zero totalPages for empty results", async () => {
    mockGet.mockResolvedValueOnce({ data: { results: [] } });

    const result = await searchCardsWithPagination({ query: "NONEXISTENT", page: 1, limit: 30 });

    expect(result.cards.length).toBe(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
