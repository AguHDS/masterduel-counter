export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  has_counter_guide?: boolean;
  has_deck_guide?: boolean;
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

// Card type for selected/saved cards (local URLs from backend)
// These URLs point to our backend (/api/uploads/cards/{id}.jpg)
export interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
  chainNumber?: number | null;
  frameType?: string;
  level?: number;
}

export interface CardPair {
  id: string;
  section?: "HANDTRAP" | "BOARD_BREAKER" | null;
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
  stepType?: "NORMAL" | "PENDULUM" | null;
  leftScaleValue?: number | null;
  rightScaleValue?: number | null;
  mainCards: Card[];
  subCards: Card[];
  leftSubCards: Card[];
}
