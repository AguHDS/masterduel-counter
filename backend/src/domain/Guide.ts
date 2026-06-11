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
  isDraft: boolean;
  draftExpiresAt?: Date | null;
  guideRequestId?: number | null;
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
  isDraft?: boolean;
  draftExpiresAt?: Date | null;
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
  /** If provided, the draft with this ID will be deleted after successful publish */
  draftInstanceId?: number;
}

export interface SaveDraftDTO {
  archetypeId: number;
  userId: string;
  guideType: GuideType;
  title?: string;
  headerCardId?: number | null;
  generalTip?: string | null;
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
  /** If provided, update this existing draft instead of creating a new one */
  draftInstanceId?: number;
  /** If set, the draft will auto-expire at this date (used for guide-request drafts) */
  draftExpiresAt?: Date | null;
  /** If provided, links this draft to a guide request being fulfilled */
  guideRequestId?: number | null;
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
