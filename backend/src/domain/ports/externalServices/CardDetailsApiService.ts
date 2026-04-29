export interface CardDetails {
  id: number;
  name: string;
  type?: string;
  desc?: string;
  race?: string;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  archetype?: string;
  scale?: number;
  linkval?: number;
  linkmarkers?: string[];
  card_images: Array<{
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
}

export interface CardDetailsApiService {
  /** Get card details by ID from external API (for hover tooltip) */
  getCardDetailsFromExternalApi(id: number): Promise<CardDetails | null>;
}
