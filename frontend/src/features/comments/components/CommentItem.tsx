import React, { useState } from "react";
import { Edit2, Trash2, Loader2 } from "lucide-react";
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
  onDelete,
  currentUserId,
  isInstanceOwner = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { deleteComment } = useCommentMutations({
    onError: (err) => {
      alert(err.message || "Failed to delete comment");
    },
  });

  const isDeleting = deleteComment.isPending;
  const canModify = currentUserId === comment.authorId || isInstanceOwner;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteComment.mutateAsync(comment.id);
      onDelete?.(comment.id);
    }
  };

  const formattedDate = formatRelativeTime(comment.createdAt);
  const isEdited = comment.updatedAt !== comment.createdAt;

  if (isEditing) {
    return (
      <div className="mb-4 bg-gradient-to-tr from-gray-800/60 to-gray-900/60 backdrop-blur-xs rounded-lg border border-blue-900/30 p-4">
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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
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
            <CommentForm
              instanceId={comment.instanceId}
              initialContent={comment.content}
              isEditing
              commentId={comment.id}
              onSuccess={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-opacity ${isDeleting ? "opacity-50" : ""}`}>
      <div className="bg-gradient-to-tr from-gray-800/60 to-gray-900/60 backdrop-blur-xs rounded-lg border border-blue-900/30 p-4 hover:border-blue-700/50 transition-all duration-300">
        <div className="flex items-start gap-3">
          {/* Avatar - Siempre visible */}
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
            {/* Header con nombre, fecha, edited y acciones */}
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

              {canModify && !isDeleting && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded-full hover:bg-blue-600/20 text-blue-400 transition-colors"
                    title="Edit comment"
                    disabled={isDeleting}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 rounded-full hover:bg-red-600/20 text-red-400 transition-colors"
                    title="Delete comment"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-300 mt-1 text-sm leading-relaxed break-words">
              {comment.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
