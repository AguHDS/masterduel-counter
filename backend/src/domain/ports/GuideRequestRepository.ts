import type {
  GuideRequest,
  GuideRequestWithDetails,
  GuideSourceRequestSummary,
  CreateGuideRequestDTO,
  GuideRequestListResult,
} from "@/domain/GuideRequest.js";

export interface GuideRequestRepository {
  /** Create a new guide request */
  createGuideRequest(data: CreateGuideRequestDTO): Promise<GuideRequest>;

  /** Find a request by ID with archetype/user details */
  findGuideRequestById(id: number): Promise<GuideRequestWithDetails | null>;

  /** Find the completed request that produced a guide instance */
  findGuideRequestByFulfilledInstanceId(
    instanceId: number,
  ): Promise<GuideSourceRequestSummary | null>;

  /** Paginated list with optional status filter */
  findManyGuideRequests(
    page: number,
    limit: number,
    status?: string,
  ): Promise<GuideRequestListResult>;

  /** Get the most recent OPEN requests (for home/navbar) */
  findRecentOpenRequest(limit: number): Promise<GuideRequestWithDetails[]>;

  /**
   * Atomically take a request.
   * Uses updateMany WHERE status='OPEN' — returns updated count.
   * 0 = already taken by someone else.
   */
  takeRequest(
    requestId: number,
    userId: string,
    userName: string,
  ): Promise<{ success: boolean; request: GuideRequestWithDetails | null }>;

  /** Cancel a taken request (returns it to OPEN) */
  cancelTakeRequest(requestId: number, userId: string): Promise<GuideRequest>;

  /** Mark request as COMPLETED */
  fulfillRequest(
    requestId: number,
    userId: string,
    instanceId: number,
  ): Promise<GuideRequest>;

  /** Count completed requests fulfilled by a user */
  countRequestByFulfiller(userId: string): Promise<number>;

  /** Count anonymous requests (where requesterId IS NULL) */
  countAnonymousRequest(): Promise<number>;

  /** Release TAKEN requests that have been taken for more than 7 days back to OPEN */
  releaseStaleRequests(): Promise<number>;

  /** Release a specific request by ID back to OPEN (system action, bypasses user checks) */
  releaseRequestById(requestId: number): Promise<void>;

  /** Count requests grouped by status */
  getRequestCounts(): Promise<{ OPEN: number; TAKEN: number; COMPLETED: number }>;
}
