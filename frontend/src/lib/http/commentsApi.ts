import { axiosClient } from "./axiosClient";

export interface CreateCommentRequest {
  instanceId: number;
  content: string;
}

export interface UpdateCommentRequest {
  commentId: number;
  content: string;
}

interface DeleteCommentRequest {
  commentId: number;
}

interface GetInstanceCommentsRequest {
  instanceId: number;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

interface CommentAuthor {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  instanceId: number;
  authorId: string;
  author: CommentAuthor;
}

interface CommentsPaginatedResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const commentsApi = {
  /**
   * Get comments for a specific instance
   */
  async getInstanceComments({
    instanceId,
    page = 1,
    limit = 20,
  }: GetInstanceCommentsRequest): Promise<CommentsPaginatedResponse> {
    const response = await axiosClient.get<
      ApiResponse<CommentsPaginatedResponse>
    >("/api/comments", {
      params: {
        instanceId,
        page,
        limit,
      },
    });
    return response.data.data;
  },

  /**
   * Create a new comment for an instance
   */
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await axiosClient.post<ApiResponse<{ comment: Comment }>>(
      "/api/comments",
      {
        instanceId: data.instanceId,
        content: data.content,
      },
    );
    return response.data.data.comment;
  },

  /**
   * Update an existing comment
   */
  async updateComment({
    commentId,
    content,
  }: UpdateCommentRequest): Promise<Comment> {
    const response = await axiosClient.patch<ApiResponse<{ comment: Comment }>>(
      `/api/comments/${commentId}`,
      { content },
    );
    return response.data.data.comment;
  },

  /**
   * Delete an existing comment
   */
  async deleteComment({ commentId }: DeleteCommentRequest): Promise<void> {
    await axiosClient.delete<ApiResponse<void>>(`/api/comments/${commentId}`);
  },
};
