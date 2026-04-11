export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  has_counter_guide?: number | boolean;
  has_deck_guide?: number | boolean;
  created_at: string;
  updated_at: string;
}

export interface ArchetypeUpdateDTO {
  name?: string;
  registered?: boolean;
}
