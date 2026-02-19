import type { Comment as ApiComment } from "../api/commentsApi";

export type Comment = ApiComment;

export interface CommentsSectionProps {
  instanceId: number;
  className?: string;
  maxHeight?: string;
  showTitle?: boolean;
  title?: string;
}

export interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: number) => void;
  currentUserId?: string;
  isInstanceOwner?: boolean;
}

export interface CommentFormProps {
  instanceId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialContent?: string;
  isEditing?: boolean;
  commentId?: number;
  placeholder?: string;
  autoFocus?: boolean;
}
