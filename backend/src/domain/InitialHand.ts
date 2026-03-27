export interface InitialHand {
  id: number;
  instanceId: number;
  cardIds: number[]; // Max 5 cards
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
  position: number;
  createdAt: Date;
}

export interface InitialHandCreateDTO {
  instanceId: number;
  cardIds: number[];
  position: number;
}
