// Card type for search results (temporary preview with external URLs)
// These URLs point to YGOProdeck and are only used for search preview
// When a card is selected, it's downloaded to local storage
export interface Card {
  id: number;
  name: string;
  imageUrlExternal?: string;
  imageUrlSmallExternal?: string;
  imageUrlCroppedExternal?: string;
}

export interface CardsSearchParams {
  query: string;
  page: number;
  limit: number;
}

export interface CardsSearchResponse {
  cards: Card[];
  total: number;
  page: number;
  totalPages: number;
}
