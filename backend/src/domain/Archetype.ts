export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  pending_requests: number;
  header_card_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ArchetypeSearchResult extends Archetype {
  relevance?: number;
}

export interface ArchetypeWithHeaderCard extends Archetype {
  header_card_name?: string;
  header_card_image_url?: string;
  header_card_image_url_small?: string;
}

export interface ArchetypeCreateDTO {
  name: string;
  registered?: boolean;
  pending_requests?: number;
  header_card_id?: number | null;
}

export interface ArchetypeUpdateDTO {
  name?: string;
  registered?: boolean;
  pending_requests?: number;
  header_card_id?: number | null;
}

export interface ArchetypeRequestDTO {
  archetype_id?: number;
  archetype_name?: string;
}

export interface ArchetypeRequestResponse {
  success: boolean;
  message: string;
  archetype: Archetype;
  current_requests: number;
}