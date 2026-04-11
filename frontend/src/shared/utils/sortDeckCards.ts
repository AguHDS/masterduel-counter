interface SortableCard {
  frameType?: string;
  level?: number;
}

/**
 * Sorts deck cards: monsters (level asc) → spells → traps.
 * Cards without frameType are treated as monsters.
 */
export function sortDeckCards<T extends SortableCard>(cards: T[]): T[] {
  return [...cards].sort((a, b) => {
    const order = (ft?: string) => {
      const f = ft?.toLowerCase();
      if (f === "spell") return 2;
      if (f === "trap") return 3;
      return 1;
    };
    const diff = order(a.frameType) - order(b.frameType);
    if (diff !== 0) return diff;
    return (a.level ?? 0) - (b.level ?? 0);
  });
}
