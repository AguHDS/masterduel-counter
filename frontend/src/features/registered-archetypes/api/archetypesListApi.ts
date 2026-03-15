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

export interface RegisteredArchetypesResponse {
  success: boolean;
  data: {
    archetypes: ArchetypeWithCreator[];
  };
}

/**
 * Get all registered archetypes (with at least 1 guide instance)
 */
export const getRegisteredArchetypes = async (
  sortBy: "recent" | "instances" = "recent",
): Promise<RegisteredArchetypesResponse> => {
  const response = await axiosClient.get<RegisteredArchetypesResponse>(
    "/api/archetypes/registered",
    {
      params: { sortBy },
    },
  );

  return response.data;
};
