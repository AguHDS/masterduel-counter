import {
  Comment,
  CommentWithAuthor,
  CreateCommentDTO,
  UpdateCommentDTO,
  CommentsPaginatedResponse,
} from "@/domain/Comment.js";
import { CommentRepository } from "@/domain/ports/CommentRepository.js";
import { CommentApplicationPort } from "@/application/ports/CommentApplicationPort.js";
import { NotificationApplicationPort } from "@/application/ports/NotificationApplicationPort.js";
import { GuideRepository } from "@/domain/ports/GuideRepository.js";

export class CommentApplicationService implements CommentApplicationPort {
  constructor(
    private commentRepository: CommentRepository,
    private notificationService: NotificationApplicationPort,
    private instanceRepository: GuideRepository,
  ) {}

  async createComment(data: CreateCommentDTO): Promise<Comment> {
    if (!data.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    if (data.content.length > 2500) {
      throw new Error("Comment is too long (max 2500 characters)");
    }

    // Validate parent comment if this is a reply
    if (data.parentCommentId) {
      const isValidParent = await this.commentRepository.validateParentComment(
        data.parentCommentId,
        data.instanceId,
      );

      if (!isValidParent) {
        throw new Error(
          "Parent comment not found or belongs to different instance",
        );
      }
    }

    const comment = await this.commentRepository.createComment(data);

    // Create notifications (async, don't wait)
    this.createCommentNotification(
      data.instanceId,
      comment.id,
      data.authorId,
      data.parentCommentId,
    ).catch((error) => {
      console.error("Failed to create comment notification:", error);
    });

    return comment;
  }

  private async createCommentNotification(
    instanceId: number,
    commentId: number,
    commentorId: string,
    parentCommentId?: number | null,
  ): Promise<void> {
    try {
      // Get instance to find the owner
      const instance =
        await this.instanceRepository.findArchetypeInstanceById(instanceId);
      if (!instance) return;

      // Get commentor info
      const commentor =
        await this.commentRepository.getCommentAuthor(commentorId);
      if (!commentor) return;

      // If this is a reply, notify the parent comment author
      if (parentCommentId) {
        const parentComment =
          await this.commentRepository.findCommentById(parentCommentId);
        if (parentComment && parentComment.authorId !== commentorId) {
          // Notify parent comment author about the reply
          await this.notificationService.createCommentNotification(
            parentComment.authorId,
            instanceId,
            commentId,
            commentorId,
            commentor.name,
          );
        }
      }

      // Also notify guide owner if they're not the commentor
      if (instance.userId !== commentorId) {
        await this.notificationService.createCommentNotification(
          instance.userId,
          instanceId,
          commentId,
          commentorId,
          commentor.name,
        );
      }
    } catch (error) {
      console.error("Error in createCommentNotification:", error);
    }
  }

  async getCommentById(id: number): Promise<CommentWithAuthor | null> {
    const result = await this.commentRepository.findCommentsByInstanceId(
      id,
      1,
      1,
    );
    const comment = result.comments.find((c: CommentWithAuthor) => c.id === id);
    return comment || null;
  }

  async getCommentByGuideId(
    instanceId: number,
    page = 1,
    limit = 20,
  ): Promise<CommentsPaginatedResponse> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 100) limit = 100;

    return this.commentRepository.findCommentsByInstanceId(
      instanceId,
      page,
      limit,
    );
  }

  async updateComment(
    commentId: number,
    userId: string,
    data: UpdateCommentDTO,
  ): Promise<Comment> {
    if (!data.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    if (data.content.length > 2500) {
      throw new Error("Comment is too long (max 2500 characters)");
    }

    const isAuthor = await this.commentRepository.isCommentAuthor(
      commentId,
      userId,
    );
    if (!isAuthor) {
      throw new Error("You can only edit your own comments");
    }

    return this.commentRepository.updateComment(commentId, data);
  }

  async deleteComment(commentId: number, userId: string): Promise<void> {
    const canModify = await this.canModifyComment(commentId, userId);
    if (!canModify) {
      throw new Error("You don't have permission to delete this comment");
    }

    await this.commentRepository.deleteComment(commentId);
  }

  async canModifyComment(commentId: number, userId: string): Promise<boolean> {
    const isAuthor = await this.commentRepository.isCommentAuthor(
      commentId,
      userId,
    );
    if (isAuthor) return true;

    const isOwner = await this.commentRepository.isInstanceOwner(
      commentId,
      userId,
    );
    return isOwner;
  }
}
