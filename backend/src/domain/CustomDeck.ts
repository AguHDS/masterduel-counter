// Custom deck for user profile

export interface CustomDeck {
  id: number;
  userId: string;
  title: string;
  mainDeckCards: number[];
  extraDeckCards: number[];
  sideDeckCards: number[]; // Array of card IDs (max 20)
  headerCardId?: number; // Optional card ID for custom preview image
  isPublic: boolean;
  displayOrder: number; // User-defined order for display (lower = first)
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomDeckCreateDTO {
  userId: string;
  title: string;
  mainDeckCards: number[];
  extraDeckCards: number[];
  sideDeckCards?: number[]; // Optional, defaults to []
  headerCardId?: number; // Optional card ID for custom preview image
  isPublic?: boolean;
}

export interface CustomDeckUpdateDTO {
  title?: string;
  mainDeckCards?: number[];
  extraDeckCards?: number[];
  sideDeckCards?: number[];
  headerCardId?: number; // Optional card ID for custom preview image
  isPublic?: boolean;
  displayOrder?: number;
}

export interface CustomDeckReorderDTO {
  deckOrders: { deckId: number; displayOrder: number }[];
}

export interface CustomDeckWithCards {
  id: number;
  userId: string;
  title: string;
  isPublic: boolean;
  headerCardId?: number; // Optional card ID for custom preview image
  displayOrder: number;
  headerCard?: {
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  };
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
