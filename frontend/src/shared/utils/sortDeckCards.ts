interface SortableCard {
  frameType?: string;
  level?: number;
}

const MONSTER_TYPE_PRIORITY: Record<string, number> = {
  normal: 1,
  ritual: 2,
  fusion: 3,
  synchro: 4,
  xyz: 5,
  link: 6,
};

/**
 * Sorts deck cards: monsters by subtype priority (Normal → Ritual → Fusion → Synchro → XYZ → Link)
 * then by level ascending, followed by spells, then traps.
 * Cards without frameType or with unlisted frameTypes (Effect, Pendulum, etc.) are sorted after Link,
 * only by level ascending.
 */
export function sortDeckCards<T extends SortableCard>(cards: T[]): T[] {
  return [...cards].sort((a, b) => {
    const ftA = a.frameType?.toLowerCase();
    const ftB = b.frameType?.toLowerCase();

    const order = (ft?: string) => {
      if (ft === "spell") return 2;
      if (ft === "trap") return 3;
      return 1;
    };
    const groupDiff = order(ftA) - order(ftB);
    if (groupDiff !== 0) return groupDiff;

    const priA = MONSTER_TYPE_PRIORITY[ftA ?? ""] ?? 99;
    const priB = MONSTER_TYPE_PRIORITY[ftB ?? ""] ?? 99;
    if (priA !== priB) return priA - priB;

    return (a.level ?? 0) - (b.level ?? 0);
  });
}
