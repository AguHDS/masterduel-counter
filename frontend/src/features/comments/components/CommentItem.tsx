import React, { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { useCommentMutations } from "../hooks/useCommentsQueries";
import { CommentForm } from "./CommentForm";
import type { CommentItemProps } from "../types/commentsTypes";

const AvatarPlaceholder = ({ name }: { name: string }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
    {name.charAt(0).toUpperCase()}
  </div>
);

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  const intervals = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ] as const;

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return rtf.format(-count, interval.unit);
    }
  }

  return rtf.format(0, "second");
};

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onEdit,
  onDelete,
  currentUserId,
  isInstanceOwner = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { updateComment, deleteComment } = useCommentMutations();

  const canModify = currentUserId === comment.authorId || isInstanceOwner;

  const handleEdit = async (content: string) => {
    await updateComment.mutateAsync({
      commentId: comment.id,
      content,
    });
    setIsEditing(false);
    onEdit?.(comment.id, content);
  };

  const handleDelete = async () => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este comentario?")
    ) {
      await deleteComment.mutateAsync(comment.id);
      onDelete?.(comment.id);
    }
  };

  const formattedDate = formatRelativeTime(comment.createdAt);
  const isEdited = comment.updatedAt !== comment.createdAt;

  if (isEditing) {
    return (
      <div className="mb-4">
        <CommentForm
          instanceId={comment.instanceId}
          initialContent={comment.content}
          isEditing
          commentId={comment.id}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="group">
      <div
        className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-lg border border-blue-900/30 p-4 hover:border-blue-700/50 transition-all duration-300"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-start gap-3">
          {comment.author.image ? (
            <img
              src={comment.author.image}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <AvatarPlaceholder name={comment.author.name} />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">
                {comment.author.name}
              </span>
              <span className="text-xs text-blue-400/60">•</span>
              <span
                className="text-xs text-blue-400/60"
                title={new Date(comment.createdAt).toLocaleString()}
              >
                {formattedDate}
              </span>
              {isEdited && (
                <>
                  <span className="text-xs text-blue-400/60">•</span>
                  <span className="text-xs text-blue-400/40 italic">
                    (edited)
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-300 mt-1 text-sm leading-relaxed break-words">
              {comment.content}
            </p>

            {canModify && showActions && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded-full hover:bg-blue-600/20 text-blue-400 transition-colors"
                  title="Edit comment"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-full hover:bg-red-600/20 text-red-400 transition-colors"
                  title="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
