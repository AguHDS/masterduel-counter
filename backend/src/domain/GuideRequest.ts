export type GuideRequestStatus = "OPEN" | "TAKEN" | "COMPLETED";
export type GuideRequestGuideType = "COUNTER" | "DECK";

export interface GuideRequest {
  id: number;
  title: string;
  description: string | null;
  archetypeId: number;
  guideType: GuideRequestGuideType;
  status: GuideRequestStatus;
  requesterId: string | null;
  requesterAlias: string;
  fulfilledById: string | null;
  fulfilledInstanceId: number | null;
  takenById: string | null;
  takenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuideRequestWithDetails extends GuideRequest {
  archetypeName: string;
  requesterProfilePictureUrl?: string | null;
  fulfilledByName?: string | null;
  takenByName?: string | null;
}

export interface GuideRequestCounts {
  OPEN: number;
  TAKEN: number;
  COMPLETED: number;
}

export interface CreateGuideRequestDTO {
  title: string;
  description?: string;
  archetypeId: number;
  guideType: GuideRequestGuideType;
  requesterId?: string;
  requesterAlias: string;
}

export interface GuideRequestListResult {
  items: GuideRequestWithDetails[];
  total: number;
  page: number;
  limit: number;
}
