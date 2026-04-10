import { axiosClient } from "@/lib/http";
import { type Archetype, type GuideType } from "@/features/archetypes/types";
import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";
import type { GuideInstanceWithFullDetails } from "@/lib/http/guideInstancesApi";

const API_BASE_URL = getBackendUrl();

export interface CardPairDTO {
  topCardIds: number[];
  bottomCardIds: Array<{ cardId: number; effectiveness?: string }>;
  comment?: string;
}

export interface ComboStepDTO {
  mainCardIds: number[];
  subCardIds: number[];
  leftSubCardIds?: number[];
  description?: string;
  parentCanceledStepIndex?: number;
  stepOrder: number;
}

export interface ComboStepsDTO {
  initialHandId: number;
  steps: ComboStepDTO[];
}

export interface FinalBoardDTO {
  fieldSpellCardId: number | null;
  extraMonsterCardIds: Array<number | null>;
  monsterCardIds: Array<number | null>;
  spellTrapCardIds: Array<number | null>;
  handCardIds: Array<number | null>;
  graveyardCardIds: number[];
  banishedCardIds: number[];
  description?: string;
}

export interface RecommendedDeckCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

export interface RecommendedDeck {
  id: number;
  instanceId: number;
  title?: string;
  mainDeck: RecommendedDeckCard[];
  extraDeck: RecommendedDeckCard[];
  sideDeck: RecommendedDeckCard[];
  createdAt: string;
  updatedAt: string;
}

export interface SaveArchetypeGuideResponse {
  success: boolean;
  archetype?: Archetype;
  instance?: {
    id: number;
    archetypeId: number;
    userId: string;
    title: string;
    headerCardId: number | null;
    generalTip: string | null;
    likes: number;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

/**
 * Save and register a guide for an archetype
 */
export const saveArchetypeGuide = async (
  archetypeId: number,
  guideType: GuideType,
  cardPairs?: CardPairDTO[],
  initialHands?: Array<{
    cardIds: number[];
    description?: string;
    finalBoard?: FinalBoardDTO;
  }>,
  title?: string,
  headerCardId?: number,
  generalTip?: string,
  instanceId?: number,
  comboSteps?: ComboStepsDTO[],
): Promise<SaveArchetypeGuideResponse> => {
  const response = await axiosClient.post<SaveArchetypeGuideResponse>(
    `/api/archetypes/${archetypeId}/register`,
    { guideType, cardPairs, initialHands, title, headerCardId, generalTip, instanceId, comboSteps },
  );

  return response.data;
};

/**
 * Delete a guide by its ID (with ownership verification)
 */
export const deleteArchetypeGuide = async (
  instanceId: number,
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete<{ success: boolean; message: string }>(
    `${API_BASE_URL}/api/instances/${instanceId}`,
    { withCredentials: true },
  );
  return response.data;
};

/**
 * Get instance guide by its ID
 */
export const getInstanceGuideById = async (
  instanceId: number,
): Promise<GuideInstanceWithFullDetails> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/instances/${instanceId}`,
  );
  return response.data;
};

/**
 * Toggle like on a guide (add if not exists, remove if exists)
 */
export const toggleLike = async (
  archetypeId: number,
  instanceId: number,
): Promise<{ success: boolean; liked: boolean; likes: number }> => {
  const response = await axios.post<{
    success: boolean;
    liked: boolean;
    likes: number;
  }>(
    `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/like`,
    {},
    { withCredentials: true },
  );
  return response.data;
};

/**
 * Get like status for a guide
 */
export const getGuideLikeStatus = async (
  archetypeId: number,
  instanceId: number,
): Promise<{ success: boolean; liked: boolean }> => {
  const response = await axios.get<{ success: boolean; liked: boolean }>(
    `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/like/status`,
    { withCredentials: true },
  );
  return response.data;
};

/**
 * Check if current user has favorited an instance
 */
export const getFavoriteGuideStatus = async (
  archetypeId: number,
  instanceId: number,
): Promise<{ success: boolean; favorited: boolean }> => {
  const response = await axios.get<{ success: boolean; favorited: boolean }>(
    `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/${instanceId}/favorite/status`,
    { withCredentials: true },
  );
  return response.data;
};

/**
 * Get recommended deck for an instance
 */
export const getRecommendedDeck = async (
  instanceId: number,
): Promise<RecommendedDeck | null> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/instances/${instanceId}/recommended-deck`,
      { withCredentials: true },
    );
    return response.data.deck;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // No deck exists
    }
    throw error;
  }
};

/**
 * Create or update recommended deck
 */
export const saveRecommendedDeck = async (
  instanceId: number,
  title: string | undefined,
  mainDeckCards: number[],
  extraDeckCards: number[],
  sideDeckCards: number[] = [],
): Promise<RecommendedDeck> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/instances/${instanceId}/recommended-deck`,
    { title, mainDeckCards, extraDeckCards, sideDeckCards },
    { withCredentials: true },
  );
  return response.data.deck;
};

/**
 * Delete recommended deck
 */
export const deleteRecommendedDeck = async (
  instanceId: number,
): Promise<void> => {
  await axios.delete(
    `${API_BASE_URL}/api/instances/${instanceId}/recommended-deck`,
    { withCredentials: true },
  );
};
