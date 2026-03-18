export interface ArchetypeInstance {
  id: number;
  archetypeId: number;
  userId: string;
  title: string;
  headerCardId: number | null;
  generalTip?: string | null;
  likes: number;
  favorites: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArchetypeInstanceCreateDTO {
  archetypeId: number;
  userId: string;
  title: string;
  headerCardId: number | null;
  generalTip?: string | null;
}

export interface ArchetypeInstanceUpdateDTO {
  title?: string;
  headerCardId?: number | null;
  generalTip?: string | null;
}

export interface RegisterInstanceDTO {
  archetypeId: number;
  userId: string;
  title: string;
  headerCardId: number;
  generalTip?: string | null;
  cardPairs: Array<{
    topCardIds: number[];
    bottomCardIds: number[];
    effectiveness?: string;
    comment?: string;
  }>;
  instanceId?: number;
}

export interface ArchetypeGuideListItem extends ArchetypeInstance {
  archetypeName: string;
  userName: string;
  userProfilePictureUrl?: string | null;
  headerCardName?: string;
  headerCardImageUrl?: string;
}
