export interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  instanceId: number;
  authorId: string;
  parentCommentId: number | null;
}

export interface CommentWithAuthor extends Comment {
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  replies?: CommentWithAuthor[];
  replyCount?: number;
}

export interface CreateCommentDTO {
  instanceId: number;
  authorId: string;
  content: string;
  parentCommentId?: number | null;
}

export interface UpdateCommentDTO {
  content: string;
}

export interface CommentsPaginatedResponse {
  comments: CommentWithAuthor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
