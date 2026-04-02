import { axiosClient } from "@/lib/http";
import type { GuideType } from "@/features/archetypes/types";

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
 * Optionally filtered by guide type
 */
export const getRegisteredArchetypes = async (
  sortBy: "recent" | "instances" = "recent",
  guideType?: GuideType,
): Promise<RegisteredArchetypesResponse> => {
  const params: { sortBy: string; type?: string } = { sortBy };
  
  if (guideType) {
    params.type = guideType.toLowerCase();
  }

  const response = await axiosClient.get<RegisteredArchetypesResponse>(
    "/api/archetypes/registered",
    { params },
  );

  return response.data;
};
