import { PrismaClient } from "@prisma/client";
import type { LatestUpdateRepository } from "@/domain/ports/LatestUpdateRepository.js";
import type {
  LatestUpdate,
  LatestUpdateWithAuthor,
  CreateLatestUpdateDTO,
  UpdateLatestUpdateDTO,
} from "@/domain/LatestUpdate.js";

export class PrismaLatestUpdateRepository implements LatestUpdateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async CreateLatestUpdate(data: CreateLatestUpdateDTO): Promise<LatestUpdate> {
    const created = await this.prisma.latestUpdate.create({
      data: {
        title: data.title,
        content: data.content,
        authorId: data.authorId,
      },
    });

    return this.toDomain(created);
  }

  async findLastestUpdateById(id: number): Promise<LatestUpdateWithAuthor | null> {
    const result = await this.prisma.latestUpdate.findUnique({
      where: { id },
      include: {
        author: { select: { name: true } },
      },
    });

    if (!result) return null;

    return {
      ...this.toDomain(result),
      authorName: result.author.name,
    };
  }

  async findAllLastestUpdates(limit: number = 5): Promise<LatestUpdateWithAuthor[]> {
    const results = await this.prisma.latestUpdate.findMany({
      include: {
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return results.map((r) => ({
      ...this.toDomain(r),
      authorName: r.author.name,
    }));
  }

  async findAllPaginatedLastestUpdates(
    page: number,
    limit: number,
  ): Promise<{ posts: LatestUpdateWithAuthor[]; total: number }> {
    const skip = (page - 1) * limit;

    const [results, total] = await this.prisma.$transaction([
      this.prisma.latestUpdate.findMany({
        include: {
          author: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.latestUpdate.count(),
    ]);

    return {
      posts: results.map((r) => ({
        ...this.toDomain(r),
        authorName: r.author.name,
      })),
      total,
    };
  }

  async updateLastestUpdate(
    id: number,
    data: UpdateLatestUpdateDTO,
  ): Promise<LatestUpdate> {
    const updated = await this.prisma.latestUpdate.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
      },
    });

    return this.toDomain(updated);
  }

  async deleteLastestUpdate(id: number): Promise<void> {
    await this.prisma.latestUpdate.delete({ where: { id } });
  }

  private toDomain(db: {
    id: number;
    title: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  }): LatestUpdate {
    return {
      id: db.id,
      title: db.title,
      content: db.content,
      authorId: db.authorId,
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
    };
  }
}
