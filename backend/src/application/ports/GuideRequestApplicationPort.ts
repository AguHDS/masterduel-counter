import type {
  GuideRequest,
  GuideRequestWithDetails,
  GuideRequestListResult,
  GuideRequestCounts,
  GuideRequestGuideType,
  GuideSourceRequestSummary,
} from "@/domain/GuideRequest.js";
import type { NotificationApplicationPort } from "@/application/ports/NotificationApplicationPort.js";

export interface CreateGuideRequestParams {
  title: string;
  description?: string;
  archetypeId: number;
  guideType: GuideRequestGuideType;
  requesterId?: string; // Authenticated userId, or undefined for anonymous
  requesterName?: string; // Display name of the requester (if not provided, an alias is generated)
}

export interface TakeGuideRequestResult {
  success: boolean;
  message: string;
  request: GuideRequestWithDetails | null;
}

export interface GuideRequestApplicationPort {
  /** Create a new guide request (anonymous or authenticated) */
  createRequest(params: CreateGuideRequestParams): Promise<GuideRequest>;
  
  /** Get paginated list of requests */
  getRequests(
    page: number,
    limit: number,
    status?: string,
  ): Promise<GuideRequestListResult>;

  /** Get N most recent OPEN requests (home/navbar) */
  getRecentOpenRequests(limit: number): Promise<GuideRequestWithDetails[]>;

  /** Get a single request by ID */
  getRequestById(id: number): Promise<GuideRequestWithDetails | null>;

  /** Get the completed request associated with a guide instance, if any */
  getRequestByFulfilledInstanceId(
    instanceId: number,
  ): Promise<GuideSourceRequestSummary | null>;

  /** Atomically take a request */
  takeRequest(
    requestId: number,
    userId: string,
    userName: string,
  ): Promise<TakeGuideRequestResult>;

  /** Cancel a previously taken request */
  cancelTakeRequest(requestId: number, userId: string): Promise<GuideRequest>;

  /**
   * Fulfill a guide request by linking it to a newly saved guide instance
   * Sends a notification to the original requester if they were authenticated
   */
  fulfillRequest(
    requestId: number,
    userId: string,
    userName: string,
    instanceId: number,
    notificationService: NotificationApplicationPort,
  ): Promise<GuideRequest>;

  /** Get the number of requests fulfilled by a user */
  getCompletedRequestsCountByUser(userId: string): Promise<number>;

  /** Get counts per status (for tab badges) */
  getRequestCounts(): Promise<GuideRequestCounts>;
}
