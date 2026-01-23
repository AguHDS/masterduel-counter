export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  pending_requests: number;
}

export interface SearchResponse {
  data: {
    archetypes: Archetype[];
  };
  message?: string;
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
