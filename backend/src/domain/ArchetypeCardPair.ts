export interface ArchetypeCardPair {
  id: number;
  instance_id: number;
  pair_order: number;
  effectiveness: string | null;
  comment: string | null;
  created_at: string;
  top_card_ids: number[];
  bottom_card_ids: number[];
}

export interface ArchetypeCardPairCreateDTO {
  instance_id: number;
  top_card_ids: number[];
  bottom_card_ids: number[];
  pair_order: number;
  effectiveness?: string | null;
  comment?: string | null;
}

export interface ArchetypeCardPairWithDetails extends Omit<ArchetypeCardPair, 'top_card_ids' | 'bottom_card_ids'> {
  top_cards: Array<{
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
  }>;
  bottom_cards: Array<{
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
  }>;
}
