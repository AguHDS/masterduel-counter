import React, { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCommentMutations } from "../hooks/useCommentsQueries";
import type { CommentFormProps } from "../types/commentsTypes";

export const CommentForm: React.FC<CommentFormProps> = ({
  instanceId,
  onSuccess,
  onCancel,
  initialContent = "",
  isEditing = false,
  commentId,
  parentCommentId,
  placeholder = "Write a comment...",
  autoFocus = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { createComment, updateComment } = useCommentMutations({
    onSuccess: () => {
      setContent("");
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.message || "Error saving comment. Please try again.");
    },
  });

  const isSubmitting = isEditing
    ? updateComment.isPending
    : createComment.isPending;

  // Determinar el texto del botón según el contexto
  const getButtonText = () => {
    if (isSubmitting) {
      return isEditing ? "Updating..." : "Posting...";
    }

    if (isEditing) {
      return "Update";
    }

    // Si tiene parentCommentId, es una respuesta
    if (parentCommentId) {
      return "Reply";
    }

    // Si no, es un comentario nuevo de primer nivel
    return "Comment";
  };

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    if (!user) {
      setError("You must be logged in to comment");
      return;
    }

    setError(null);

    try {
      if (isEditing && commentId) {
        await updateComment.mutateAsync({
          commentId,
          content: content.trim(),
        });
      } else {
        await createComment.mutateAsync({
          instanceId,
          content: content.trim(),
          parentCommentId,
        });
      }
    } catch (err) {
      console.error("Error saving comment:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={user ? placeholder : "Login to comment"}
          disabled={!user || isSubmitting}
          rows={3}
          className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-blue-300/40 focus:outline-none focus:ring-1 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-blue-900/30 focus:border-blue-600/50 focus:ring-blue-600/50"
          }`}
        />

        {!user && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
            <p className="text-blue-300/60 text-sm">
              <a href="/login" className="text-blue-400 hover:underline">
                Login
              </a>{" "}
              to comment
            </p>
          </div>
        )}

        {isSubmitting && (
          <div className="absolute bottom-3 right-3">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}

        {content.trim() && (
          <button
            type="submit"
            disabled={!user || isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-blue-600/50 to-purple-600/50 backdrop-blur-sm text-white text-sm rounded-lg hover:from-blue-600/80 hover:to-purple-600/80 active:from-blue-700/90 active:to-purple-700/90 transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl active:shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {getButtonText()}
              </>
            ) : (
              <>{getButtonText()}</>
            )}
          </button>
        )}
      </div>
    </form>
  );
};
