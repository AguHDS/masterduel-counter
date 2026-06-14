/**
 * Reorders an array by moving an element from one index to another.
 * The dragged card moves to the target position; all cards between
 * fromIndex and toIndex shift to make room.
 *
 * Returns a new array (does not mutate the original).
 * Returns the original array unchanged if indices are out of bounds.
 */
export function reorderCardsInZone<T>(
  cards: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (fromIndex < 0 || fromIndex >= cards.length) return cards;
  if (toIndex < 0 || toIndex >= cards.length) return cards;
  if (fromIndex === toIndex) return cards;

  const result = [...cards];
  const [dragged] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, dragged);
  return result;
}
