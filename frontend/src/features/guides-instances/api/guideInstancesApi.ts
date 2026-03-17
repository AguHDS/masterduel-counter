import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";
import type { GuideListItem } from "@/lib/http/guideInstancesApi";

const API_BASE_URL = getBackendUrl();

export const guideInstancesApi = {
  /** Get all guides for the selected archetype */
  getGuidesByArchetypeId: async (
    archetypeId: number,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<GuideListItem[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances`,
      { params: { sortBy } },
    );
    return response.data;
  },

  /** Search guide instances by archetype ID and title */
  searchGuidesByArchetypeId: async (
    archetypeId: number,
    title: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<GuideListItem[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/archetypes/${archetypeId}/instances/search`,
      { params: { title, sortBy } },
    );
    return response.data;
  },
};
