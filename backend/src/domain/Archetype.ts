export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArchetypeUpdateDTO {
  name?: string;
  registered?: boolean;
}
