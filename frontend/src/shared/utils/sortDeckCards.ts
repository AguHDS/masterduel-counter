interface SortableCard {
  frameType?: string;
  level?: number;
}

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

const groupOf = (ft?: string) => {
  if (ft === "spell") return 2;
  if (ft === "trap") return 3;
  return 1; // all monsters
};

function compareCards(a: SortableCard, b: SortableCard): number {
  const ftA = a.frameType?.toLowerCase();
  const ftB = b.frameType?.toLowerCase();

  const groupDiff = groupOf(ftA) - groupOf(ftB);
  if (groupDiff !== 0) return groupDiff;

  const priA = MONSTER_ORDER[ftA ?? ""] ?? 7;
  const priB = MONSTER_ORDER[ftB ?? ""] ?? 7;
  if (priA !== priB) return priA - priB;

  return (a.level ?? 0) - (b.level ?? 0);
}

/**
 * Sorts deck cards by group (Monsters -> Spells -> Traps),
 * then within monsters by subtype:
 *   Normal -> Effect/Pendulum -> Ritual -> Fusion →->Synchro -> XYZ -> Link
 * then by level ascending within each subtype
 */
export function sortDeckCards<T extends SortableCard>(cards: T[]): T[] {
  return [...cards].sort(compareCards);
}

/**
 * Inserts a new card at the correct sorted position without reordering existing cards
 * Existing card order (example: manual drag-and-drop) is preserved
 */
export function insertCardSorted<T extends SortableCard>(cards: T[], newCard: T): T[] {
  const result = [...cards];
  let insertIndex = result.length;
  for (let i = 0; i < result.length; i++) {
    if (compareCards(newCard, result[i]) < 0) {
      insertIndex = i;
      break;
    }
  }
  result.splice(insertIndex, 0, newCard);
  return result;
}
