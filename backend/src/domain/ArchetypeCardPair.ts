export interface ArchetypeCardPair {
  id: number;
  instance_id: number;
  top_card_id: number;
  bottom_card_id: number;
  pair_order: number;
  effectiveness: string | null;
  comment: string | null;
  created_at: string;
}

export interface ArchetypeCardPairCreateDTO {
  instance_id: number;
  top_card_id: number;
  bottom_card_id: number;
  pair_order: number;
  effectiveness?: string | null;
  comment?: string | null;
}

export interface ArchetypeCardPairWithDetails extends ArchetypeCardPair {
  top_card_name: string;
  top_card_image_url: string;
  top_card_image_url_small: string;
  bottom_card_name: string;
  bottom_card_image_url: string;
  bottom_card_image_url_small: string;
}
