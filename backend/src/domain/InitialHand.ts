export interface InitialHand {
  id: number;
  instanceId: number;
  cardIds: number[]; // Max 5 cards
  description?: string;
  position: number;
  createdAt: Date;
}

export interface InitialHandWithCards {
  id: number;
  instanceId: number;
  cards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  description?: string;
  position: number;
  createdAt: Date;
}

export interface InitialHandCreateDTO {
  instanceId: number;
  cardIds: number[];
  description?: string;
  position: number;
}
