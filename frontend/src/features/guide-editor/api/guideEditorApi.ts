import { axiosClient } from "@/lib/http";
import { type Archetype } from "@/features/archetypes/types";

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
