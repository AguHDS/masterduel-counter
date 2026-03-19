// Custom deck for user profile

export interface CustomDeck {
  id: number;
  userId: string;
  title: string;
  mainDeckCards: number[];
  extraDeckCards: number[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomDeckCreateDTO {
  userId: string;
  title: string;
  mainDeckCards: number[];
  extraDeckCards: number[];
  isPublic?: boolean;
}

export interface CustomDeckUpdateDTO {
  title?: string;
  mainDeckCards?: number[];
  extraDeckCards?: number[];
  isPublic?: boolean;
}

export interface CustomDeckWithCards {
  id: number;
  userId: string;
  title: string;
  isPublic: boolean;
  mainDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  extraDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
