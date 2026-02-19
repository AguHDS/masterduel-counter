import type { Comment as ApiComment } from "../api/commentsApi";

export type Comment = ApiComment;

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
  replyCount?: number;
}

export interface CommentsSectionProps {
  instanceId: number;
  className?: string;
  maxHeight?: string;
  showTitle?: boolean;
  title?: string;
}

export interface CommentItemProps {
  comment: CommentWithReplies;
  onDelete?: (commentId: number) => void;
  currentUserId?: string;
  isInstanceOwner?: boolean;
  depth?: number;
  maxDepth?: number;
}

export interface CommentFormProps {
  instanceId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialContent?: string;
  isEditing?: boolean;
  commentId?: number;
  parentCommentId?: number;
  placeholder?: string;
  autoFocus?: boolean;
  onReply?: () => void;
}