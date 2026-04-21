export interface FinalBoardCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

export type CardPosition = 'atk' | 'def';

export interface FinalBoardPreview {
  fieldSpellCardId: number | null;
  extraMonsterCardIds: Array<number | null>;
  monsterCardIds: Array<number | null>;
  spellTrapCardIds: Array<number | null>;
  handCardIds: Array<number | null>;
  graveyardCardIds: number[];
  banishedCardIds: number[];
  description?: string;
  monsterPositions?: Array<CardPosition>;
  extraMonsterPositions?: Array<CardPosition>;
}

export interface FinalBoardPreviewWithCards {
  fieldSpell: FinalBoardCard | null;
  extraMonsters: Array<FinalBoardCard | null>;
  monsters: Array<FinalBoardCard | null>;
  spellTraps: Array<FinalBoardCard | null>;
  hand: Array<FinalBoardCard | null>;
  graveyard: FinalBoardCard[];
  banished: FinalBoardCard[];
  description?: string;
  monsterPositions?: Array<CardPosition>;
  extraMonsterPositions?: Array<CardPosition>;
}

export interface InitialHand {
  id: number;
  instanceId: number;
  cardIds: number[]; // Max 5 cards
  description?: string;
  finalBoard?: FinalBoardPreview;
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
  finalBoard?: FinalBoardPreviewWithCards;
  position: number;
  createdAt: Date;
}

export interface InitialHandCreateDTO {
  instanceId: number;
  cardIds: number[];
  description?: string;
  finalBoard?: FinalBoardPreview;
  position: number;
}
