import {
  Comment,
  CommentWithAuthor,
  CreateCommentDTO,
  UpdateCommentDTO,
  CommentsPaginatedResponse,
} from "@/domain/Comment";

export interface CommentServicePort {
  /** Create a new comment (supports replies) */
  createComment(data: CreateCommentDTO): Promise<Comment>;

  /** Get a comment by its ID */
  getCommentById(id: number): Promise<CommentWithAuthor | null>;

  /** Get comments by instance ID with pagination (includes replies) */
  getCommentsByInstanceId(
    instanceId: number,
    page?: number,
    limit?: number,
  ): Promise<CommentsPaginatedResponse>;

  /** Update an existing comment (only author can update) */
  updateComment(
    commentId: number,
    userId: string,
    data: UpdateCommentDTO,
  ): Promise<Comment>;

  /** Delete a comment (author or instance owner can delete) */
  deleteComment(commentId: number, userId: string): Promise<void>;

  /** Check if a user can modify a comment (author or instance owner) */
  canModifyComment(commentId: number, userId: string): Promise<boolean>;
}
