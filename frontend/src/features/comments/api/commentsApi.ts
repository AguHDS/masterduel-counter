import { axiosClient } from "@/lib/http";

export interface CreateCommentRequest {
  instanceId: number;
  content: string;
  parentCommentId?: number;
}

export interface UpdateCommentRequest {
  commentId: number;
  content: string;
}

export interface DeleteCommentRequest {
  commentId: number;
}

export interface GetInstanceCommentsRequest {
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
  parentCommentId?: number | null;
}

export interface CommentsPaginatedResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get comments for a specific instance
 */
export const getInstanceComments = async (
  instanceId: number,
  page: number = 1,
  limit: number = 20,
): Promise<CommentsPaginatedResponse> => {
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
};

/**
 * Create a new comment for an instance
 */
export const createComment = async (
  data: CreateCommentRequest,
): Promise<Comment> => {
  const response = await axiosClient.post<ApiResponse<{ comment: Comment }>>(
    "/api/comments",
    {
      instanceId: data.instanceId,
      content: data.content,
      parentCommentId: data.parentCommentId,
    },
  );
  return response.data.data.comment;
};

/**
 * Update an existing comment
 */
export const updateComment = async (
  commentId: number,
  content: string,
): Promise<Comment> => {
  const response = await axiosClient.patch<ApiResponse<{ comment: Comment }>>(
    `/api/comments/${commentId}`,
    { content },
  );
  return response.data.data.comment;
};

/**
 * Delete an existing comment
 */
export const deleteComment = async (commentId: number): Promise<void> => {
  await axiosClient.delete<ApiResponse<void>>(`/api/comments/${commentId}`);
};
