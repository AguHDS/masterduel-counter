export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  pending_requests: number;
  header_card_id: number | null;
}

export interface SearchResponse {
  data: {
    archetypes: Archetype[];
  };
  message?: string;
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
  try {
    if (!searchTerm || searchTerm.trim() === "") {
      return { data: { archetypes: [] } };
    }

    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
    const url = `${API_BASE}/api/searchArchetype?name=${encodeURIComponent(searchTerm)}&limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching archetypes:", error);
    throw error;
  }
};

/**
 * Register an archetype with its card pairs
 */
export const registerArchetype = async (
  archetypeId: number,
  cardPairs: CardPairDTO[],
  headerCardId?: number,
): Promise<RegisterArchetypeResponse> => {
  try {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
    const url = `${API_BASE}/api/archetypes/${archetypeId}/register`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ cardPairs, headerCardId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error registering archetype:", error);
    throw error;
  }
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
  try {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
    const url = `${API_BASE}/api/archetypes/${archetypeId}/with-header`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching archetype with header:", error);
    throw error;
  }
};

/**
 * Get card pairs for an archetype
 */
export const getArchetypeCardPairs = async (
  archetypeId: number,
): Promise<GetCardPairsResponse> => {
  try {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
    const url = `${API_BASE}/api/archetypes/${archetypeId}/card-pairs`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching archetype card pairs:", error);
    throw error;
  }
};
