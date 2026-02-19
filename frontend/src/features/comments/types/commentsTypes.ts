import type { Comment as ApiComment } from "@/lib/http/commentsApi";

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
  onEdit?: (commentId: number, content: string) => void;
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
