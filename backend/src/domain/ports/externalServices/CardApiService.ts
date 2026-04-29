export interface RawCardData {
  id: number;
  name: string;
  type?: string;
  desc?: string;
  race?: string;
  attribute?: string;
  atk?: number;
  def?: number;
  level?: number;
  scale?: number;
  linkval?: number;
  linkmarkers?: string[];
  archetype?: string;
  frameType?: string;
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
