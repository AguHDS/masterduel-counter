export interface GuideCardPair {
  id: number;
  instance_id: number;
  pair_order: number;
  effectiveness: string | null;
  comment: string | null;
  created_at: string;
  top_card_ids: number[];
  bottom_card_ids: number[];
}

export interface GuideCardPairCreateDTO {
  instance_id: number;
  top_card_ids: number[];
  bottom_card_ids: number[];
  pair_order: number;
  effectiveness?: string | null;
  comment?: string | null;
}

export interface GuideCardPairWithDetails extends Omit<GuideCardPair, 'top_card_ids' | 'bottom_card_ids'> {
  top_cards: Array<{
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
  bottom_cards: Array<{
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
}
