import { axiosClient } from "./axiosClient";
import type { GuideType, InitialHand } from "@/features/archetypes/types";

export interface GuideListItem {
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
  createdAt: string;
  updatedAt: string;
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
  /** True when this guide is saved as a draft (only visible to the owner) */
  isDraft?: boolean;
}

export interface GuideInstanceWithFullDetails {
  instance: {
    id: number;
    archetypeId: number;
    userId: string;
    title: string;
    headerCardId: number | null;
    generalTip?: string | null;
    guideType: GuideType;
    isDraft: boolean;
    guideRequestId?: number | null;
    likes: number;
    favorites: number;
    views: number;
    createdAt: string;
    updatedAt: string;
  };
  userName: string;
  userProfilePictureUrl: string | null;
  archetypeName: string;
  sourceRequest?: {
    id: number;
    title: string;
    status: "OPEN" | "TAKEN" | "COMPLETED";
  } | null;
  headerCard: {
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  } | null;
  cardPairs: Array<{
    id: number;
    pairSection?: "HANDTRAP" | "BOARD_BREAKER" | null;
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
  }>;
  initialHands?: Array<{
    id: number;
    cards: Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
      imageUrlCropped: string;
    }>;
    description?: string;
    finalBoard?: {
      fieldSpell: {
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
      } | null;
      extraMonsters: Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
      } | null>;
      monsters: Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
      } | null>;
      spellTraps: Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
      } | null>;
      hand: Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
      } | null>;
      graveyard: Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
      }>;
      banished: Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
      }>;
      description?: string;
      monsterPositions?: Array<"atk" | "def">;
      extraMonsterPositions?: Array<"atk" | "def">;
    };
    position: number;
    comboSteps?: Array<{
      id: number;
      stepOrder: number;
      description?: string | null;
      parentCanceledStepId?: number | null;
      stepType?: string | null;
      leftScaleValue?: number | null;
      rightScaleValue?: number | null;
      mainCards: Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
        chain_number: number | null;
      }>;
      subCards: Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
        chain_number: number | null;
      }>;
      leftSubCards: Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
        chain_number: number | null;
      }>;
    }>;
  }>;
}

/** Centralized API for guide related operations (reusable operations) */
export const guideInstancesApi = {
  /** Toggle favorite on a guide (add if not exists, remove if exists) */
  toggleFavoriteGuide: async (
    archetypeId: number,
    instanceId: number,
  ): Promise<{ success: boolean; favorited: boolean; favorites: number }> => {
    const response = await axiosClient.post<{
      success: boolean;
      favorited: boolean;
      favorites: number;
    }>(`/api/archetypes/${archetypeId}/instances/${instanceId}/favorite`, {});
    return response.data;
  },

  /**
   * Register a view count for a guide
   */
  registerView: async (
    instanceId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.post<{
      success: boolean;
      message: string;
    }>(`/api/instances/${instanceId}/view`, {});
    return response.data;
  },

  /**
   * Get the latest created guides across all archetypes
   * @param limit - Number of instances to fetch (default: 5, max: 50)
   * @param guideType - Optional filter by guide type
   */
  getLatestCreatedGuides: async (
    limit: number = 5,
    guideType?: GuideType,
  ): Promise<GuideListItem[]> => {
    const params: { limit: number; type?: string } = { limit };
    if (guideType) {
      params.type = guideType.toLowerCase();
    }
    const response = await axiosClient.get<GuideListItem[]>(
      `/api/guides/latest`,
      { params },
    );
    return response.data;
  },

  /**
   * Get initial hands for a deck guide instance
   */
  getInitialHands: async (instanceId: number): Promise<InitialHand[]> => {
    const response = await axiosClient.get<InitialHand[]>(
      `/api/instances/${instanceId}/initial-hands`,
    );
    return response.data;
  },
};
