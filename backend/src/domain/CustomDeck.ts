export interface CustomDeck {
  id: number;
  userId: string;
  title: string;
  mainDeckCards: number[];
  extraDeckCards: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomDeckCreateDTO {
  userId: string;
  title: string;
  mainDeckCards: number[];
  extraDeckCards: number[];
}

export interface CustomDeckUpdateDTO {
  title?: string;
  mainDeckCards?: number[];
  extraDeckCards?: number[];
}

export interface CustomDeckWithCards {
  id: number;
  userId: string;
  title: string;
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
