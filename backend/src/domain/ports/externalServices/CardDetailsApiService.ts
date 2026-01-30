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
    image_url_cropped: string;
  }>;
}

export interface CardDetailsApiService {
  getCardDetails(id: number): Promise<CardDetails | null>;
}
