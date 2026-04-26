import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";
import type { GuideListItem } from "@/lib/http/guideInstancesApi";
import type { GuideType } from "@/features/archetypes/types";

const API_BASE_URL = getBackendUrl();

export const guideInstancesApi = {
  /** Get all guides for the selected archetype */
  getGuidesByArchetypeId: async (
    archetypeId: number,
    sortBy: "likes" | "updated" | "views" = "updated",
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
    sortBy: "likes" | "updated" | "views" = "updated",
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

  /** Get all guides across all archetypes (optionally filtered by type, searched by title or archetype name) */
  getAllGuides: async (
    sortBy: "likes" | "updated" | "views" = "updated",
    guideType?: GuideType,
    search?: string,
  ): Promise<GuideListItem[]> => {
    const params: { sortBy: string; type?: string; search?: string } = { sortBy };
    if (guideType) {
      params.type = guideType.toLowerCase();
    }
    if (search && search.trim()) {
      params.search = search.trim();
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/guides`,
      { params },
    );
    return response.data;
  },
};
