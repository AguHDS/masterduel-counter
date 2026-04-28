export interface RawCardData {
  id: number;
  name: string;
  frameType?: string;
  level?: number;
  card_images: Array<{
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
}

export interface CardApiService {
  /** Search for cards by their name in YGOProDeck API */
  searchCardByNameFromExternalApi(name: string): Promise<RawCardData[]>;
  /** Find a card by its ID in YGOProDeck API */
  findCardByIdFromExternalApi(id: number): Promise<RawCardData | null>;
}
