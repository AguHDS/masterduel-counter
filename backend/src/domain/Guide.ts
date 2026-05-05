import type { FinalBoardPreview } from "@/domain/InitialHand.js";

export type GuideType = "COUNTER" | "DECK";

export interface Guide {
  id: number;
  archetypeId: number;
  userId: string;
  title: string;
  headerCardId: number | null;
  generalTip?: string | null;
  guideType: GuideType;
  likes: number;
  favorites: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuideCreateDTO {
  archetypeId: number;
  userId: string;
  title: string;
  headerCardId: number | null;
  generalTip?: string | null;
  guideType: GuideType;
}

export interface GuideUpdateDTO {
  title?: string;
  headerCardId?: number | null;
  generalTip?: string | null;
}

export interface RegisterGuideDTO {
  archetypeId: number;
  userId: string;
  title: string;
  headerCardId: number;
  generalTip?: string | null;
  guideType: GuideType;
  cardPairs?: Array<{
    topCardIds: number[];
    bottomCardIds: Array<{ cardId: number; effectiveness?: string | null }>;
    pairSection?: "HANDTRAP" | "BOARD_BREAKER" | null;
    comment?: string;
  }>;
  initialHands?: Array<{
    cardIds: number[];
    description?: string;
    finalBoard?: FinalBoardPreview;
  }>;
  comboSteps?: Array<{
    initialHandId: number;
    steps: Array<{
      mainCardIds: number[];
      mainCardChains?: (number | null)[];
      subCardIds: number[];
      subCardChains?: (number | null)[];
      leftSubCardIds: number[];
      leftSubCardChains?: (number | null)[];
      description?: string;
      parentCanceledStepIndex?: number;
      stepOrder: number;
    }>;
  }>;
  instanceId?: number;
}

export interface GuideListItem extends Guide {
  archetypeName: string;
  userName: string;
  userProfilePictureUrl?: string | null;
  headerCardName?: string;
  headerCardImageUrl?: string;
  minutesAgo?: number;
  hasHandtraps?: boolean;
  hasBoardbreakers?: boolean;
  hasInitialHands?: boolean;
  hasRecommendedDeck?: boolean;
}
