import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

export interface CardDetails {
  id: number;
  name: string;
  type: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  archetype?: string;
  scale?: number;
  linkval?: number;
  linkmarkers?: string[];
  card_images: Array<{
    image_url: string;
    image_url_small: string;
  }>;
}

export const cardDetailsApi = {
  getCardDetails: async (cardId: number): Promise<CardDetails> => {
    const response = await axios.get(`${API_BASE_URL}/api/cards/${cardId}`);
    return response.data;
  },
};
