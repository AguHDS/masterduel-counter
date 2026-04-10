export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  instance_count?: number;
}

export type GuideType = "COUNTER" | "DECK";

export interface SearchResponse {
  data: {
    archetypes: Archetype[];
    total?: number;
  };
  message?: string;
}

export interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

export interface CardPair {
  id: string;
  topCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  bottomCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
    effectiveness?: string;
  }>;
  comment?: string;
}

export interface InitialHand {
  id: string;
  cards: Card[];
  description?: string;
  finalBoard?: {
    fieldSpell: Card | null;
    extraMonsters: Array<Card | null>;
    monsters: Array<Card | null>;
    spellTraps: Array<Card | null>;
    hand: Array<Card | null>;
    graveyard: Card[];
    banished: Card[];
    description?: string;
  };
  comboSteps?: ComboStep[];
}

export interface ComboStep {
  id: string;
  stepOrder: number;
  description?: string | null;
  parentCanceledStepId?: string | null;
  mainCards: Card[];
  subCards: Card[];
  leftSubCards: Card[];
}
