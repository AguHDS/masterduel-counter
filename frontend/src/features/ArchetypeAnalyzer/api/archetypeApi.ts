import { axiosClient } from "@/lib/http";

export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  pending_requests: number;
  header_card_id: number | null;
  created_by_user_id: number | null;
}

export interface ArchetypeWithCreator extends Archetype {
  created_by_username?: string;
}

export interface SearchResponse {
  data: {
    archetypes: Archetype[];
  };
  message?: string;
}

export interface RegisteredArchetypesResponse {
  success: boolean;
  data: {
    archetypes: ArchetypeWithCreator[];
  };
}

export interface CardPairDTO {
  topCardId: number;
  bottomCardId: number;
  effectiveness?: string;
  comment?: string;
}

export interface RegisterArchetypeRequest {
  cardPairs: CardPairDTO[];
}

export interface RegisterArchetypeResponse {
  success: boolean;
  archetype: Archetype;
  message: string;
}

export interface ArchetypeCardPairWithDetails {
  id: number;
  archetype_id: number;
  top_card_id: number;
  bottom_card_id: number;
  pair_order: number;
  effectiveness: string | null;
  comment: string | null;
  created_at: string;
  top_card_name: string;
  top_card_image_url: string;
  top_card_image_url_small: string;
  bottom_card_name: string;
  bottom_card_image_url: string;
  bottom_card_image_url_small: string;
}

export interface GetCardPairsResponse {
  success: boolean;
  cardPairs: ArchetypeCardPairWithDetails[];
}

/**
 * Search for archetypes by name
 */
export const searchArchetypes = async (
  searchTerm: string,
  limit: number = 50,
): Promise<SearchResponse> => {
  if (!searchTerm || searchTerm.trim() === "") {
    return { data: { archetypes: [] } };
  }

  const response = await axiosClient.get<SearchResponse>("/api/searchArchetype", {
    params: {
      name: searchTerm,
      limit,
    },
  });
  
  return response.data;
};

/**
 * Register an archetype with its card pairs
 */
export const registerArchetype = async (
  archetypeId: number,
  cardPairs: CardPairDTO[],
  headerCardId?: number,
): Promise<RegisterArchetypeResponse> => {
  const response = await axiosClient.post<RegisterArchetypeResponse>(
    `/api/archetypes/${archetypeId}/register`,
    { cardPairs, headerCardId }
  );
  
  return response.data;
};

/**
 * Get archetype with header card details
 */
export const getArchetypeWithHeaderCard = async (
  archetypeId: number,
): Promise<{
  success: boolean;
  archetype: Archetype & {
    header_card_name?: string;
    header_card_image_url?: string;
    header_card_image_url_small?: string;
  };
}> => {
  const response = await axiosClient.get(`/api/archetypes/${archetypeId}/with-header`);
  return response.data;
};

/**
 * Get card pairs for an archetype
 */
export const getArchetypeCardPairs = async (
  archetypeId: number,
): Promise<GetCardPairsResponse> => {
  const response = await axiosClient.get<GetCardPairsResponse>(
    `/api/archetypes/${archetypeId}/card-pairs`
  );
  
  return response.data;
};

/**
 * Get all registered archetypes with creator information
 */
export const getRegisteredArchetypes = async (): Promise<RegisteredArchetypesResponse> => {
  const response = await axiosClient.get<RegisteredArchetypesResponse>(
    "/api/archetypes/registered"
  );
  
  return response.data;
};
