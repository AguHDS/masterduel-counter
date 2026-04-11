// Recommende deck for guides

export interface RecommendedDeck {
  id: number;
  instanceId: number;
  title?: string;
  mainDeckCards: number[]; // Array of card IDs
  extraDeckCards: number[]; // Array of card IDs
  sideDeckCards: number[]; // Array of card IDs (max 20)
  createdAt: Date;
  updatedAt: Date;
}

export interface RecommendedDeckCreateDTO {
  instanceId: number;
  title?: string;
  mainDeckCards: number[];
  extraDeckCards: number[];
  sideDeckCards?: number[]; // Optional, defaults to []
}

export interface RecommendedDeckUpdateDTO {
  title?: string;
  mainDeckCards?: number[];
  extraDeckCards?: number[];
  sideDeckCards?: number[];
}

export interface RecommendedDeckWithCards {
  id: number;
  instanceId: number;
  title?: string;
  mainDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
    frameType?: string;
    level?: number;
  }>;
  extraDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
    frameType?: string;
    level?: number;
  }>;
  sideDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
    frameType?: string;
    level?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
