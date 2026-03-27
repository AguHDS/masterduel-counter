export type GuideType = "COUNTER" | "DECK";

export interface Guide {
  id: number;
  archetypeId: number;
  userId: string;
  title: string;
  headerCardId: number | null;
  generalTip?: string | null;
  guideType: GuideType;
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
  guideType: GuideType;
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
  guideType: GuideType;
  cardPairs?: Array<{
    topCardIds: number[];
    bottomCardIds: number[];
    effectiveness?: string;
    comment?: string;
  }>;
  initialHands?: Array<{
    cardIds: number[];
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
