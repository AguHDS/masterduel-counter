import type {
  GuideRequest,
  GuideRequestWithDetails,
  GuideRequestListResult,
  GuideRequestCounts,
} from "@/domain/GuideRequest.js";
import type { GuideRequestRepository } from "@/domain/ports/GuideRequestRepository.js";
import type {
  GuideRequestApplicationPort,
  CreateGuideRequestParams,
  TakeGuideRequestResult,
} from "@/application/ports/GuideRequestApplicationPort.js";
import type { NotificationApplicationPort } from "@/application/ports/NotificationApplicationPort.js";

export class GuideRequestApplicationService implements GuideRequestApplicationPort {
  constructor(private guideRequestRepository: GuideRequestRepository) {}

  async createRequest(params: CreateGuideRequestParams): Promise<GuideRequest> {
    const {
      title,
      description,
      archetypeId,
      guideType,
      requesterId,
      requesterName,
    } = params;

    let requesterAlias: string;

    if (requesterId && requesterName) {
      requesterAlias = requesterName;
    } else {
      // Generate anonymous alias
      const anonCount = await this.guideRequestRepository.countAnonymousRequest();
      requesterAlias = `Anonymous-${anonCount + 1}`;
    }

    return this.guideRequestRepository.createGuideRequest({
      title,
      description,
      archetypeId,
      guideType,
      requesterId,
      requesterAlias,
    });
  }

  async getRequests(
    page: number,
    limit: number,
    status?: string,
  ): Promise<GuideRequestListResult> {
    // Auto-release stale TAKEN requests before returning list
    await this.guideRequestRepository.releaseStaleRequests();
    return this.guideRequestRepository.findManyGuideRequests(page, limit, status);
  }

  async getRecentOpenRequests(
    limit: number,
  ): Promise<GuideRequestWithDetails[]> {
    await this.guideRequestRepository.releaseStaleRequests();
    return this.guideRequestRepository.findRecentOpenRequest(limit);
  }

  async getRequestById(id: number): Promise<GuideRequestWithDetails | null> {
    await this.guideRequestRepository.releaseStaleRequests();
    return this.guideRequestRepository.findGuideRequestById(id);
  }

  async takeRequest(
    requestId: number,
    userId: string,
    userName: string,
  ): Promise<TakeGuideRequestResult> {
    const result = await this.guideRequestRepository.takeRequest(
      requestId,
      userId,
      userName,
    );

    if (!result.success) {
      return {
        success: false,
        message: "This request has already been taken by someone else.",
        request: null,
      };
    }

    return {
      success: true,
      message: "Request taken successfully.",
      request: result.request,
    };
  }

  async cancelTakeRequest(
    requestId: number,
    userId: string,
  ): Promise<GuideRequest> {
    const request = await this.guideRequestRepository.findGuideRequestById(requestId);

    if (!request) {
      throw new Error("Request not found.");
    }

    if (request.takenById !== userId) {
      throw new Error("You are not the one who took this request.");
    }

    if (request.status !== "TAKEN") {
      throw new Error("This request is not in TAKEN status.");
    }

    return this.guideRequestRepository.cancelTakeRequest(requestId, userId);
  }

  async fulfillRequest(
    requestId: number,
    userId: string,
    userName: string,
    instanceId: number,
    notificationService: NotificationApplicationPort,
  ): Promise<GuideRequest> {
    const request = await this.guideRequestRepository.findGuideRequestById(requestId);

    if (!request) {
      throw new Error("Request not found.");
    }

    if (request.status === "COMPLETED") {
      throw new Error("This request has already been fulfilled.");
    }

    const fulfilled = await this.guideRequestRepository.fulfillRequest(
      requestId,
      userId,
      instanceId,
    );

    // Notify the original requester (if they were logged in)
    if (request.requesterId && request.requesterId !== userId) {
      try {
        await notificationService.createGuideRequestFulfilledNotification(
          request.requesterId,
          instanceId,
          userName,
        );
      } catch {
        // Don't fail the whole operation if notification fails
      }
    }

    return fulfilled;
  }

  async getCompletedRequestsCountByUser(userId: string): Promise<number> {
    return this.guideRequestRepository.countRequestByFulfiller(userId);
  }

  async getRequestCounts(): Promise<GuideRequestCounts> {
    return this.guideRequestRepository.getRequestCounts();
  }
}
