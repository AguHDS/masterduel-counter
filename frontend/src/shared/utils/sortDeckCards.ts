interface SortableCard {
  frameType?: string;
  level?: number;
}

/**
 * Sorts deck cards by group (Monsters → Spells → Traps),
 * then within monsters by subtype:
 *   Normal → Effect/Pendulum → Ritual → Fusion → Synchro → XYZ → Link
 * then by level ascending within each subtype.
 */
export function sortDeckCards<T extends SortableCard>(cards: T[]): T[] {
  return [...cards].sort((a, b) => {
    const ftA = a.frameType?.toLowerCase();
    const ftB = b.frameType?.toLowerCase();

    // 1) Group: monster(1) → spell(2) → trap(3)
    const groupOf = (ft?: string) => {
      if (ft === "spell") return 2;
      if (ft === "trap") return 3;
      return 1; // all monsters
    };
    const groupDiff = groupOf(ftA) - groupOf(ftB);
    if (groupDiff !== 0) return groupDiff;

    // 2) Monster subtype priority
    const MONSTER_ORDER: Record<string, number> = {
      normal: 0,
      effect: 1,
      pendulum: 1,
      ritual: 2,
      fusion: 3,
      synchro: 4,
      xyz: 5,
      link: 6,
    };
    const priA = MONSTER_ORDER[ftA ?? ""] ?? 7;
    const priB = MONSTER_ORDER[ftB ?? ""] ?? 7;
    if (priA !== priB) return priA - priB;

    // 3) Level ascending
    return (a.level ?? 0) - (b.level ?? 0);
  });
}
