export interface FavoriteDeck {
  archetypeId: number;
  archetypeName: string;
  cardId: number;
  mainCount?: number;
  extraCount?: number;
  sideCount?: number;
}

export type TabType = "profile" | "decks" | "guides" | "favorites";
