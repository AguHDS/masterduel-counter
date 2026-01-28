export interface ArchetypeInstance {
  id: number;
  archetypeId: number;
  userId: string;
  headerCardId: number | null;
  generalTip?: string | null;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArchetypeInstanceCreateDTO {
  archetypeId: number;
  userId: string;
  headerCardId: number | null;
  generalTip?: string | null;
}

export interface ArchetypeInstanceUpdateDTO {
  headerCardId?: number | null;
  generalTip?: string | null;
}

export interface ArchetypeInstanceWithDetails extends ArchetypeInstance {
  archetypeName: string;
  userName: string;
  headerCardName?: string;
  headerCardImageUrl?: string;
}
