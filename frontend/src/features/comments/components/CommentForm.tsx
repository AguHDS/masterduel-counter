import React, { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
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
  placeholder = "Escribe un comentario...",
  autoFocus = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { createComment, updateComment } = useCommentMutations();

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    if (!user) {
      setError("Debes iniciar sesión para comentar");
      return;
    }

    setError(null);
    setIsSubmitting(true);

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
        });
      }

      setContent("");
      onSuccess?.();
    } catch (err) {
      setError("Error al guardar el comentario. Intenta de nuevo.");
      console.error("Error saving comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
          placeholder={user ? placeholder : "Inicia sesión para comentar"}
          disabled={!user || isSubmitting}
          rows={3}
          className="w-full px-4 py-3 bg-gray-900/50 border border-blue-900/30 rounded-lg text-white placeholder-blue-300/40 focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {!user && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
            <p className="text-blue-300/60 text-sm">
              <a href="/login" className="text-blue-400 hover:underline">
                Inicia sesión
              </a>{" "}
              para comentar
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={!user || !content.trim() || isSubmitting}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
        >
          <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          {isEditing ? "Actualizar" : "Comentar"}
        </button>
      </div>
    </form>
  );
};
