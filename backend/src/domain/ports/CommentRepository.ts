import {
  Comment,
  CreateCommentDTO,
  UpdateCommentDTO,
  CommentsPaginatedResponse,
} from "../Comment.js";

export interface CommentRepository {
  /** Create a new comment (supports replies via parentCommentId) */
  createComment(data: CreateCommentDTO): Promise<Comment>;

  /** Find a comment by its ID */
  findCommentById(id: number): Promise<Comment | null>;

  /** Find comments by instance ID with pagination (includes replies) */
  findCommentsByInstanceId(
    instanceId: number,
    page?: number,
    limit?: number,
  ): Promise<CommentsPaginatedResponse>;

  /** Update an existing comment */
  updateComment(id: number, data: UpdateCommentDTO): Promise<Comment>;

  /** Delete a comment by its ID */
  deleteComment(id: number): Promise<void>;

  /** Check if a user is the author of a comment */
  isCommentAuthor(commentId: number, userId: string): Promise<boolean>;

  /** Get the instance ID that a comment belongs to */
  getInstanceIdFromComment(commentId: number): Promise<number | null>;

  /** Check if a user is the owner of the instance that contains this comment */
  isInstanceOwner(commentId: number, userId: string): Promise<boolean>;

  /** Count comments by instance ID */
  countCommentsByInstanceId(instanceId: number): Promise<number>;

  /** Validate that parent comment exists and belongs to same instance */
  validateParentComment(
    parentCommentId: number,
    instanceId: number,
  ): Promise<boolean>;

  /** Get comment author info (for notifications) */
  getCommentAuthor(userId: string): Promise<{ id: string; name: string } | null>;
}
