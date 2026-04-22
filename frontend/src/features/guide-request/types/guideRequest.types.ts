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
  requesterProfilePictureUrl?: string | null;
  fulfilledById: string | null;
  fulfilledInstanceId: number | null;
  takenById: string | null;
  takenAt: string | null;
  createdAt: string;
  updatedAt: string;
  archetypeName?: string;
  fulfilledByName?: string | null;
  takenByName?: string | null;
}

export interface GuideRequestListResult {
  items: GuideRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface GuideRequestCounts {
  OPEN: number;
  TAKEN: number;
  COMPLETED: number;
  ALL: number;
}

export interface CreateGuideRequestPayload {
  title: string;
  description?: string;
  archetypeId: number;
  guideType: GuideRequestGuideType;
}
