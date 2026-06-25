import { axiosClient } from "@/lib/http";

export interface CardSearchResult {
  id: number;
  name: string;
  imageUrlExternal?: string;
  imageUrlSmallExternal?: string;
  imageUrlCroppedExternal?: string;
  frameType?: string;
  level?: number;
}

// Search for cards by name query
export const searchCards = async (
  query: string,
  limit = 50,
): Promise<CardSearchResult[]> => {
  const response = await axiosClient.get<{ results: CardSearchResult[] }>(
    "/api/cards/search",
    {
      params: { query, limit },
    },
  );

  return response.data.results;
};

