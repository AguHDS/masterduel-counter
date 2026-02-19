import { commentsApi as libCommentsApi } from "@/lib/http/commentsApi";
import type {
  CreateCommentRequest,
  UpdateCommentRequest,
  Comment,
  CommentsPaginatedResponse,
} from "@/lib/http/commentsApi";

// Re-exportamos los tipos para mantener consistencia
export type {
  CreateCommentRequest,
  UpdateCommentRequest,
  Comment,
  CommentsPaginatedResponse,
};

/**
 * Get comments for a specific instance
 */
export const getInstanceComments = async (
  instanceId: number,
  page: number = 1,
  limit: number = 20,
): Promise<CommentsPaginatedResponse> => {
  return libCommentsApi.getInstanceComments({ instanceId, page, limit });
};

/**
 * Create a new comment
 */
export const createComment = async (
  data: CreateCommentRequest,
): Promise<Comment> => {
  return libCommentsApi.createComment(data);
};

/**
 * Update an existing comment
 */
export const updateComment = async (
  commentId: number,
  content: string,
): Promise<Comment> => {
  return libCommentsApi.updateComment({ commentId, content });
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: number): Promise<void> => {
  return libCommentsApi.deleteComment({ commentId });
};
