import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState } from "react";
import { useCounterGuideHandlers } from "../counter-guides/useCounterGuideHandlers";
import type { CardPair } from "@/features/archetypes/types";

function Wrapper() {
  const [pairs, setPairs] = useState<CardPair[]>([
    {
      id: "existing",
      section: "HANDTRAP",
      topCards: [],
      bottomCards: [],
      comment: undefined,
    },
  ]);

  const handlers = useCounterGuideHandlers({ setPairs });

  return { pairs, handlers };
}

describe("useCounterGuideHandlers", () => {
  it("should add a HANDTRAP pair before BOARD_BREAKER", () => {
    const { result } = renderHook(() => Wrapper());

    // Add a BOARD_BREAKER first, then a HANDTRAP
    act(() => {
      result.current.handlers.addBoardBreaker();
    });
    act(() => {
      result.current.handlers.addHandtrap();
    });

    const pairs = result.current.pairs;
    // First pair = existing HANDTRAP, second = new HANDTRAP, third = BOARD_BREAKER
    expect(pairs).toHaveLength(3);
    expect(pairs[0].section).toBe("HANDTRAP");
    expect(pairs[1].section).toBe("HANDTRAP");
    expect(pairs[2].section).toBe("BOARD_BREAKER");
  });

  it("should add a BOARD_BREAKER at the end", () => {
    const { result } = renderHook(() => Wrapper());

    act(() => {
      result.current.handlers.addBoardBreaker();
      result.current.handlers.addBoardBreaker();
    });

    const pairs = result.current.pairs;
    expect(pairs).toHaveLength(3);
    expect(pairs[1].section).toBe("BOARD_BREAKER");
    expect(pairs[2].section).toBe("BOARD_BREAKER");
  });

  it("should generate unique IDs", () => {
    const { result } = renderHook(() => Wrapper());

    act(() => {
      result.current.handlers.addHandtrap();
      result.current.handlers.addHandtrap();
    });

    const ids = result.current.pairs.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
