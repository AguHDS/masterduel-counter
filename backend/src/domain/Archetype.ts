export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  pending_requests: number;
  created_at: string;
  updated_at: string;
}

export interface ArchetypeSearchResult extends Archetype {
  relevance?: number;
}

export interface ArchetypeCreateDTO {
  name: string;
  registered?: boolean;
  pending_requests?: number;
}

export interface ArchetypeUpdateDTO {
  name?: string;
  registered?: boolean;
  pending_requests?: number;
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