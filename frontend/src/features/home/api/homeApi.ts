import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

export interface GeneralStats {
  totalArchetypes: number;
  totalGuides: number;
  topArchetypes: Array<{
    id: number;
    name: string;
    guideCount: number;
  }>;
}

export const homeApi = {
  /**
   * Get general statistics about registered archetypes and created guides
   * @param limit - Maximum number of top archetypes to return (default: 15)
   */
  async getGeneralStats(limit: number = 15): Promise<GeneralStats> {
    const response = await axios.get<{ success: boolean; data: GeneralStats }>(
      `${API_BASE_URL}/api/archetypes/stats`,
      {
        params: { limit },
      },
    );
    return response.data.data;
  },
};
