import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";
import type { GuideListItem } from "@/lib/http/guideInstancesApi";
import type { GuideType } from "@/features/archetypes/types";

const API_BASE_URL = getBackendUrl();

export const guideInstancesApi = {
  /** Get all guides for the selected archetype */
  getGuidesByArchetypeId: async (
    archetypeId: number,
    sortBy: "likes" | "updated" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> => {
    const params: { sortBy: string; type?: string } = { sortBy };
    if (guideType) {
      params.type = guideType.toLowerCase();
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances`,
      { params },
    );
    return response.data;
  },

  /** Search guide instances by archetype ID and title */
  searchGuidesByArchetypeId: async (
    archetypeId: number,
    title: string,
    sortBy: "likes" | "updated" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> => {
    const params: { title: string; sortBy: string; type?: string } = { title, sortBy };
    if (guideType) {
      params.type = guideType.toLowerCase();
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/search`,
      { params },
    );
    return response.data;
  },
};
