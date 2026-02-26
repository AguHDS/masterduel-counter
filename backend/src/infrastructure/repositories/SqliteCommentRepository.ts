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

    const allComments = await this.prisma.comment.findMany({
      where: { instanceId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profile: {
              select: {
                profilePictureUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const commentMap = new Map<number, CommentWithAuthor>();
    const rootComments: CommentWithAuthor[] = [];

    allComments.forEach((comment) => {
      commentMap.set(comment.id, {
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
          profilePictureUrl: comment.author.profile?.profilePictureUrl || null,
        },
        replies: [],
        replyCount: 0,
      });
    });

    allComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);
      if (!commentWithReplies) return;
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent && parent.replies) {
          parent.replies.push(commentWithReplies);
          parent.replyCount = parent.replies.length;
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    rootComments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const paginatedRoots = rootComments.slice(skip, skip + limit);
    const totalRoots = rootComments.length;
    const totalPages = Math.ceil(totalRoots / limit);

    return {
      comments: paginatedRoots,
      total: allComments.length,
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

  private mapToDomain(prismaComment: {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    instanceId: number;
    authorId: string;
    parentCommentId: number | null;
  }): Comment {
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
