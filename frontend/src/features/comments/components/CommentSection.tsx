import React from "react";
import { MessageCircle } from "lucide-react";
import { useComments } from "../hooks/useCommentsQueries";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import type { CommentsSectionProps } from "../types/commentsTypes";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const CommentSection: React.FC<CommentsSectionProps> = ({
  instanceId,
  className = "",
  maxHeight = "500px",
  showTitle = true,
  title = "Comments",
}) => {
  const { user } = useAuth();
  const { data, isLoading, error } = useComments({
    instanceId,
    enabled: !!instanceId,
  });

  const comments = data?.comments || [];
  const totalComments = data?.total || 0;

  if (isLoading) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-900/50 via-purple-900/20 to-blue-900/30 backdrop-blur-sm rounded-xl border border-blue-800/30 p-6 ${className}`}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-blue-300 animate-pulse">Loading comments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-gradient-to-br from-red-900/20 via-red-800/10 to-red-900/20 backdrop-blur-sm rounded-xl border border-red-800/30 p-6 ${className}`}
      >
        <div className="text-red-400 text-center py-4">
          Error loading comments
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-blue-900/10 backdrop-blur-xs rounded-xl overflow-hidden ${className}`}
    >
      {showTitle && (
        <div className="border-b border-blue-800/30 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            {title}
            {totalComments > 0 && (
              <span className="text-sm text-blue-300">
                ({totalComments} comment{totalComments !== 1 ? "s" : ""})
              </span>
            )}
          </h3>
        </div>
      )}

      <div className="p-6">
        <CommentForm
          instanceId={instanceId}
          onSuccess={() => {}}
          placeholder="Write a comment... (Max. 2500 characters)"
        />

        {comments.length > 0 ? (
          <div className="mt-6 space-y-4 overflow-y-auto" style={{ maxHeight }}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-blue-300/80 italic">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};
