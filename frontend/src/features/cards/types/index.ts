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
