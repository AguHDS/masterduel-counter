export interface FavoriteDeck {
  deckId: number;
  title: string;
  imageUrl: string | null;
  mainCount: number;
  extraCount: number;
  sideCount: number;
}

export type TabType = "profile" | "decks" | "guides" | "favorites";
