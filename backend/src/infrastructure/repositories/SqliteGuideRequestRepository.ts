import { PrismaClient } from "@prisma/client";
import type { GuideRequestRepository } from "@/domain/ports/GuideRequestRepository.js";
import type {
  GuideRequest,
  GuideRequestWithDetails,
  GuideSourceRequestSummary,
  CreateGuideRequestDTO,
  GuideRequestListResult,
  GuideRequestCounts,
} from "@/domain/GuideRequest.js";

export class SqliteGuideRequestRepository implements GuideRequestRepository {
  constructor(private prisma: PrismaClient) {}

  public async createGuideRequest(data: CreateGuideRequestDTO): Promise<GuideRequest> {
    const row = await this.prisma.guideRequest.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        archetypeId: data.archetypeId,
        guideType: data.guideType,
        requesterId: data.requesterId ?? null,
        requesterAlias: data.requesterAlias,
        status: "OPEN",
      },
    });
    return this.mapRow(row);
  }

  public async findGuideRequestById(id: number): Promise<GuideRequestWithDetails | null> {
    const row = await this.prisma.guideRequest.findUnique({
      where: { id },
      include: {
        archetype: { select: { name: true } },
        requester: { select: { profile: { select: { profilePictureUrl: true } } } },
        fulfilledBy: { select: { name: true, profile: { select: { profilePictureUrl: true } } } },
        takenBy: { select: { name: true } },
      },
    });
    if (!row) return null;
    return this.mapRowWithDetails(row);
  }

  public async findGuideRequestByFulfilledInstanceId(
    instanceId: number,
  ): Promise<GuideSourceRequestSummary | null> {
    const row = await this.prisma.guideRequest.findFirst({
      where: {
        fulfilledInstanceId: instanceId,
        status: "COMPLETED",
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      title: row.title,
      status: row.status as "OPEN" | "TAKEN" | "COMPLETED",
    };
  }

  public async findManyGuideRequests(
    page: number,
    limit: number,
    status?: string,
  ): Promise<GuideRequestListResult> {
    const skip = (page - 1) * limit;
    const where = status ? { status } : undefined;

    const [rows, total] = await Promise.all([
      this.prisma.guideRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          archetype: { select: { name: true } },
          requester: { select: { profile: { select: { profilePictureUrl: true } } } },
          fulfilledBy: { select: { name: true, profile: { select: { profilePictureUrl: true } } } },
          takenBy: { select: { name: true } },
        },
      }),
      this.prisma.guideRequest.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.mapRowWithDetails(r)),
      total,
      page,
      limit,
    };
  }

  public async findRecentOpenRequest(limit: number): Promise<GuideRequestWithDetails[]> {
    const rows = await this.prisma.guideRequest.findMany({
      where: { status: "OPEN" },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        archetype: { select: { name: true } },
        requester: { select: { profile: { select: { profilePictureUrl: true } } } },
        fulfilledBy: { select: { name: true, profile: { select: { profilePictureUrl: true } } } },
        takenBy: { select: { name: true } },
      },
    });
    return rows.map((r) => this.mapRowWithDetails(r));
  }

 public async takeRequest(
    requestId: number,
    userId: string,
    _userName: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<{ success: boolean; request: GuideRequestWithDetails | null }> {
    // Atomic update: only succeeds if status is still OPEN
    const result = await this.prisma.guideRequest.updateMany({
      where: { id: requestId, status: "OPEN" },
      data: {
        status: "TAKEN",
        takenById: userId,
        takenAt: new Date(),
      },
    });

    if (result.count === 0) {
      return { success: false, request: null };
    }

    const updated = await this.findGuideRequestById(requestId);
    return { success: true, request: updated };
  }

  public async cancelTakeRequest(
    requestId: number,
    _userId: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<GuideRequest> {
    const row = await this.prisma.guideRequest.update({
      where: { id: requestId },
      data: {
        status: "OPEN",
        takenById: null,
        takenAt: null,
      },
    });
    return this.mapRow(row);
  }

  public async fulfillRequest(
    requestId: number,
    userId: string,
    instanceId: number,
  ): Promise<GuideRequest> {
    const row = await this.prisma.guideRequest.update({
      where: { id: requestId },
      data: {
        status: "COMPLETED",
        fulfilledById: userId,
        fulfilledInstanceId: instanceId,
      },
    });
    return this.mapRow(row);
  }

  public async countRequestByFulfiller(userId: string): Promise<number> {
    return this.prisma.guideRequest.count({
      where: { fulfilledById: userId, status: "COMPLETED" },
    });
  }

  public async countAnonymousRequest(): Promise<number> {
    return this.prisma.guideRequest.count({
      where: { requesterId: null },
    });
  }

  public async releaseStaleRequests(): Promise<number> {
    const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await this.prisma.guideRequest.updateMany({
      where: {
        status: "TAKEN",
        takenAt: { lt: staleThreshold },
      },
      data: {
        status: "OPEN",
        takenById: null,
        takenAt: null,
      },
    });
    return result.count;
  }

  public async getRequestCounts(): Promise<GuideRequestCounts> {
    const [open, taken, completed] = await Promise.all([
      this.prisma.guideRequest.count({ where: { status: "OPEN" } }),
      this.prisma.guideRequest.count({ where: { status: "TAKEN" } }),
      this.prisma.guideRequest.count({ where: { status: "COMPLETED" } }),
    ]);
    return { OPEN: open, TAKEN: taken, COMPLETED: completed };
  }

  // helpers

  private mapRow(row: {
    id: number;
    title: string;
    description: string | null;
    archetypeId: number;
    guideType: string;
    status: string;
    requesterId: string | null;
    requesterAlias: string;
    fulfilledById: string | null;
    fulfilledInstanceId: number | null;
    takenById: string | null;
    takenAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): GuideRequest {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      archetypeId: row.archetypeId,
      guideType: row.guideType as "COUNTER" | "DECK",
      status: row.status as "OPEN" | "TAKEN" | "COMPLETED",
      requesterId: row.requesterId,
      requesterAlias: row.requesterAlias,
      fulfilledById: row.fulfilledById,
      fulfilledInstanceId: row.fulfilledInstanceId,
      takenById: row.takenById,
      takenAt: row.takenAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapRowWithDetails(
    row: {
      id: number;
      title: string;
      description: string | null;
      archetypeId: number;
      guideType: string;
      status: string;
      requesterId: string | null;
      requesterAlias: string;
      fulfilledById: string | null;
      fulfilledInstanceId: number | null;
      takenById: string | null;
      takenAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      archetype: { name: string };
      requester: { profile: { profilePictureUrl: string | null } | null } | null;
      fulfilledBy: { name: string; profile: { profilePictureUrl: string | null } | null } | null;
      takenBy: { name: string } | null;
    },
  ): GuideRequestWithDetails {
    return {
      ...this.mapRow(row),
      archetypeName: row.archetype.name,
      requesterProfilePictureUrl: row.requester?.profile?.profilePictureUrl ?? null,
      fulfilledByName: row.fulfilledBy?.name ?? null,
      fulfilledByProfilePictureUrl: row.fulfilledBy?.profile?.profilePictureUrl ?? null,
      takenByName: row.takenBy?.name ?? null,
    };
  }
}
