import {
  Comment,
  CommentWithAuthor,
  CreateCommentDTO,
  UpdateCommentDTO,
  CommentsPaginatedResponse,
} from "@/domain/Comment";
import { CommentRepository } from "@/domain/ports/CommentRepository";
import { CommentServicePort } from "@/application/ports/CommentService";

export class CommentServiceImpl implements CommentServicePort {
  constructor(private commentRepository: CommentRepository) {}

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

    return this.commentRepository.createComment(data);
  }

  async getCommentById(id: number): Promise<CommentWithAuthor | null> {
    const result = await this.commentRepository.findCommentsByInstanceId(
      id,
      1,
      1,
    );
    const comment = result.comments.find((c) => c.id === id);
    return comment || null;
  }

  async getCommentsByInstanceId(
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
