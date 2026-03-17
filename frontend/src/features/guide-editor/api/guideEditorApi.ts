import { axiosClient } from "@/lib/http";
import { type Archetype } from "@/features/archetypes/types";
import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

export interface CardPairDTO {
  topCardIds: number[];
  bottomCardIds: number[];
  effectiveness?: string;
  comment?: string;
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
  cardPairs: CardPairDTO[],
  title: string,
  headerCardId?: number,
  generalTip?: string,
  instanceId?: number,
): Promise<SaveArchetypeGuideResponse> => {
  const response = await axiosClient.post<SaveArchetypeGuideResponse>(
    `/api/archetypes/${archetypeId}/register`,
    { cardPairs, title, headerCardId, generalTip, instanceId },
  );

  return response.data;
};

/**
 * Delete a guide by its ID (with ownership verification)
 */
export const deleteArchetypeGuide = async (
  instanceId: number
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete<{ success: boolean; message: string }>(
    `${API_BASE_URL}/api/instances/${instanceId}`,
    { withCredentials: true }
  );
  return response.data;
};