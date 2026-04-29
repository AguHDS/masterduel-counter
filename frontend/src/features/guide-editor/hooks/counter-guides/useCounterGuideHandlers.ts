import type { Dispatch, SetStateAction } from "react";
import type { CardPair } from "@/features/archetypes/types";

interface UseCounterGuideHandlersParams {
  setPairs: Dispatch<SetStateAction<CardPair[]>>;
}

/**
 * Provides handler functions for Counter guide card pair management
 * 
 * Counter guides organize card pairs into two sections:
 * - HANDTRAP: Cards that counter hand traps
 * - BOARD_BREAKER: Cards that counter board breakers
 * 
 * These handlers maintain the proper ordering when adding new pairs
 */
export const useCounterGuideHandlers = ({
  setPairs,
}: UseCounterGuideHandlersParams) => {
  /**
   * Adds a new HANDTRAP card pair
   * Inserts before the first BOARD_BREAKER pair to maintain section order
   * or appends to the end if no BOARD_BREAKER pairs exist
   */
  const addHandtrap = () => {
    const newPair: CardPair = {
      id: `pair-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      section: "HANDTRAP",
      topCards: [],
      bottomCards: [],
      comment: undefined,
    };

    setPairs((prevPairs) => {
      const firstBoardBreakerIndex = prevPairs.findIndex(
        (pair) => pair.section === "BOARD_BREAKER",
      );

      if (firstBoardBreakerIndex === -1) {
        return [...prevPairs, newPair];
      }

      return [
        ...prevPairs.slice(0, firstBoardBreakerIndex),
        newPair,
        ...prevPairs.slice(firstBoardBreakerIndex),
      ];
    });
  };

  /**
   * Adds a new BOARD_BREAKER card pair
   * Always appends to the end of the pairs list
   */
  const addBoardBreaker = () => {
    const newPair: CardPair = {
      id: `pair-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      section: "BOARD_BREAKER",
      topCards: [],
      bottomCards: [],
      comment: undefined,
    };
    setPairs((prevPairs) => [...prevPairs, newPair]);
  };

  return {
    addHandtrap,
    addBoardBreaker,
  };
};
