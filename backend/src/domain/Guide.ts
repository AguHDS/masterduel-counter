export interface Guide {
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

export interface GuideCreateDTO {
  archetypeId: number;
  userId: string;
  title: string;
  headerCardId: number | null;
  generalTip?: string | null;
}

export interface GuideUpdateDTO {
  title?: string;
  headerCardId?: number | null;
  generalTip?: string | null;
}

export interface RegisterGuideDTO {
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

export interface GuideListItem extends Guide {
  archetypeName: string;
  userName: string;
  userProfilePictureUrl?: string | null;
  headerCardName?: string;
  headerCardImageUrl?: string;
}
