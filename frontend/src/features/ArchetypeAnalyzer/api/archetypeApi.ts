import { axiosClient } from "@/lib/http";

export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  instance_count?: number;
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
  topCardIds: number[];
  bottomCardIds: number[];
  effectiveness?: string;
  comment?: string;
}

export interface RegisterArchetypeRequest {
  cardPairs: CardPairDTO[];
}

export interface RegisterArchetypeResponse {
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
 * Search for archetypes by name
 */
export const searchArchetypes = async (
  searchTerm: string,
  limit: number = 50,
): Promise<SearchResponse> => {
  if (!searchTerm || searchTerm.trim() === "") {
    return { data: { archetypes: [] } };
  }

  const response = await axiosClient.get<SearchResponse>(
    "/api/searchArchetype",
    {
      params: {
        name: searchTerm,
        limit,
      },
    },
  );

  return response.data;
};

/**
 * Register an archetype with its card pairs
 */
export const registerArchetype = async (
  archetypeId: number,
  cardPairs: CardPairDTO[],
  title: string,
  headerCardId?: number,
  generalTip?: string,
  instanceId?: number,
): Promise<RegisterArchetypeResponse> => {
  const response = await axiosClient.post<RegisterArchetypeResponse>(
    `/api/archetypes/${archetypeId}/register`,
    { cardPairs, title, headerCardId, generalTip, instanceId },
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
  const response = await axiosClient.get(
    `/api/archetypes/${archetypeId}/with-header`,
  );
  return response.data;
};

/**
 * Get all registered archetypes with creator information
 */
export const getRegisteredArchetypes = async (
  sortBy: "recent" | "instances" = "recent"
): Promise<RegisteredArchetypesResponse> => {
  const response = await axiosClient.get<RegisteredArchetypesResponse>(
    "/api/archetypes/registered",
    {
      params: { sortBy },
    }
  );

  return response.data;
};
