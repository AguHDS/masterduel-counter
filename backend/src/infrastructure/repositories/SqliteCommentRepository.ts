import { PrismaClient } from "@prisma/client";
import {
  Comment,
  CommentWithAuthor,
  CreateCommentDTO,
  UpdateCommentDTO,
  CommentsPaginatedResponse,
} from "@/domain/Comment";
import { CommentRepository } from "@/domain/ports/CommentRepository";

export class SqliteCommentRepository implements CommentRepository {
  constructor(private prisma: PrismaClient) {}

  async createComment(data: CreateCommentDTO): Promise<Comment> {
    const comment = await this.prisma.comment.create({
      data: {
        content: data.content,
        instanceId: data.instanceId,
        authorId: data.authorId,
        parentCommentId: data.parentCommentId || null,
      },
    });

    return this.mapToDomain(comment);
  }

  async findCommentById(id: number): Promise<Comment | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    return comment ? this.mapToDomain(comment) : null;
  }

  async findCommentsByInstanceId(
    instanceId: number,
    page = 1,
    limit = 20,
  ): Promise<CommentsPaginatedResponse> {
    const skip = (page - 1) * limit;

    // First get all root comments (parentCommentId is null)
    const [rootComments, totalRoot] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          instanceId,
          parentCommentId: null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              replies: {
                include: {
                  author: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: {
          instanceId,
          parentCommentId: null,
        },
      }),
    ]);

    // Recursive function to map comments with their replies
    const mapCommentWithReplies = (comment: any): CommentWithAuthor => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      instanceId: comment.instanceId,
      authorId: comment.authorId,
      parentCommentId: comment.parentCommentId,
      author: {
        id: comment.author.id,
        name: comment.author.name,
        email: comment.author.email,
        image: comment.author.image,
      },
      replies: comment.replies?.map(mapCommentWithReplies),
      replyCount: comment.replies?.length || 0,
    });

    const comments = rootComments.map(mapCommentWithReplies);
    const totalPages = Math.ceil(totalRoot / limit);

    // Get total count of all comments (including replies) for the counter
    const totalAllComments = await this.prisma.comment.count({
      where: { instanceId },
    });

    return {
      comments,
      total: totalAllComments,
      page,
      limit,
      totalPages,
    };
  }

  async updateComment(id: number, data: UpdateCommentDTO): Promise<Comment> {
    const comment = await this.prisma.comment.update({
      where: { id },
      data: {
        content: data.content,
      },
    });

    return this.mapToDomain(comment);
  }

  async deleteComment(id: number): Promise<void> {
    // Prisma will handle cascading deletes of replies automatically
    // due to onDelete: Cascade in the self-relation
    await this.prisma.comment.delete({
      where: { id },
    });
  }

  async isCommentAuthor(commentId: number, userId: string): Promise<boolean> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    return comment?.authorId === userId;
  }

  async getInstanceIdFromComment(commentId: number): Promise<number | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { instanceId: true },
    });

    return comment?.instanceId ?? null;
  }

  async isInstanceOwner(commentId: number, userId: string): Promise<boolean> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        instance: {
          select: { userId: true },
        },
      },
    });

    return comment?.instance.userId === userId;
  }

  async countCommentsByInstanceId(instanceId: number): Promise<number> {
    return this.prisma.comment.count({
      where: { instanceId },
    });
  }

  async validateParentComment(
    parentCommentId: number,
    instanceId: number,
  ): Promise<boolean> {
    const parent = await this.prisma.comment.findUnique({
      where: { id: parentCommentId },
      select: { instanceId: true },
    });

    return parent?.instanceId === instanceId;
  }

  private mapToDomain(prismaComment: any): Comment {
    return {
      id: prismaComment.id,
      content: prismaComment.content,
      createdAt: prismaComment.createdAt,
      updatedAt: prismaComment.updatedAt,
      instanceId: prismaComment.instanceId,
      authorId: prismaComment.authorId,
      parentCommentId: prismaComment.parentCommentId,
    };
  }
}
