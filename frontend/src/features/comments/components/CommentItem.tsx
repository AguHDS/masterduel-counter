import React, { useState } from "react";
import { Edit2, Trash2, Loader2, MessageSquareReply, ChevronDown, ChevronUp } from "lucide-react";
import { useCommentMutations } from "../hooks/useCommentsQueries";
import { CommentForm } from "./CommentForm";
import type { CommentItemProps } from "../types/commentsTypes";

const AvatarPlaceholder = ({ name }: { name: string }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
    {name.charAt(0).toUpperCase()}
  </div>
);

const getOptimizedImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // If it's a Cloudinary URL, add transformations for optimized thumbnail
  if (url.includes('cloudinary.com')) {
    // Transform: c_fill for cropping, w_64,h_64 for 64x64 size, q_auto for quality, f_auto for format
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/c_fill,w_64,h_64,q_auto,f_auto/${parts[1]}`;
    }
  }
  
  return url;
};

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
  depth = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const { deleteComment } = useCommentMutations({
    onError: (err) => {
      alert(err.message || "Failed to delete comment");
    },
  });

  const isDeleting = deleteComment.isPending;
  const canModify = currentUserId === comment.authorId || isInstanceOwner;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replies?.length || 0;
  
  // Determine if we are in a deep level (more than 3 levels)
  const isDeepLevel = depth >= 3;
  // Max visible replies before the scroll
  const MAX_VISIBLE_REPLIES = 3;

  // Get the best available profile picture (prioritize profilePictureUrl from Cloudinary)
  const avatarUrl = getOptimizedImageUrl(comment.author.profilePictureUrl || comment.author.image);

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
      <div className={`${depth > 0 ? "mt-3" : "mb-4"}`}>
        <div className="bg-gradient-to-tr from-gray-800/60 to-gray-900/60 backdrop-blur-xs rounded-lg border border-blue-900/30 p-4">
          <div className="flex items-start gap-3">
            <a
              href={`/profile/${comment.author.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
              title={`View ${comment.author.name}'s profile`}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={comment.author.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30 hover:ring-blue-500/60 transition-all"
                />
              ) : (
                <AvatarPlaceholder name={comment.author.name} />
              )}
            </a>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <a
                  href={`/profile/${comment.author.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:text-blue-400 transition-colors focus:outline-none focus:underline"
                >
                  {comment.author.name}
                </a>
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
      </div>
    );
  }

  return (
    <div className={`${depth > 0 ? "mt-3" : ""}`}>
      <div
        className={`transition-opacity ${
          isDeleting ? "opacity-50" : ""
        } ${depth > 0 ? "relative ml-6 pl-4" : ""}`}
      >
        {/* Connecting line with arrow for replies */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 w-4 h-8 pointer-events-none">
            {/* Vertical line from parent */}
            <div className="absolute left-0 top-0 w-[1px] h-4 bg-blue-500 shadow-glow-blue"></div>
            {/* Horizontal line with arrow */}
            <div className="absolute left-0 top-4 w-full h-[1px] bg-blue-500 shadow-glow-blue"></div>
            {/* Arrow pointing right */}
            <div 
              className="absolute right-0 top-4 w-0 h-0 border-l-4 border-l-blue-500 border-y-2 border-y-transparent"
              style={{ transform: "translateY(-50%)" }}
            ></div>
          </div>
        )}
        
        <div className="bg-gradient-to-tr from-gray-800/60 to-gray-900/60 backdrop-blur-xs rounded-lg border border-blue-900/30 p-4 hover:border-blue-700/50 transition-all duration-300 relative z-10">
          <div className="flex items-start gap-3">
            <a
              href={`/profile/${comment.author.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
              title={`View ${comment.author.name}'s profile`}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={comment.author.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/50 hover:ring-blue-500/80 transition-all"
                />
              ) : (
                <AvatarPlaceholder name={comment.author.name} />
              )}
            </a>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`/profile/${comment.author.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:text-blue-400 transition-colors focus:outline-none focus:underline"
                >
                  {comment.author.name}
                </a>
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

                {/* Reply button */}
                {currentUserId && (
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="rounded-full hover:bg-blue-600/20 text-blue-400 transition-colors ml-1"
                    title="Reply to comment"
                  >
                    <MessageSquareReply className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Edit/Delete buttons */}
                {canModify && !isDeleting && (
                  <div className="flex items-center gap-1 ml-auto">
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

              {/* Reply form */}
              {isReplying && (
                <div className="mt-3">
                  <CommentForm
                    instanceId={comment.instanceId}
                    parentCommentId={comment.id}
                    onSuccess={() => setIsReplying(false)}
                    onCancel={() => setIsReplying(false)}
                    placeholder={`Reply to ${comment.author.name}...`}
                    autoFocus
                  />
                </div>
              )}

              {/* Toggle replies button */}
              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  {showReplies ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  {showReplies ? "Hide" : "Show"} {replyCount} {replyCount === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        {hasReplies && showReplies && (
          <div className="mt-2">
            {isDeepLevel ? (
              <>
                {/* Show only first replies */}
                <div className="space-y-2">
                  {comment.replies?.slice(0, MAX_VISIBLE_REPLIES).map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onDelete={onDelete}
                      currentUserId={currentUserId}
                      isInstanceOwner={isInstanceOwner}
                      depth={depth + 1}
                    />
                  ))}
                </div>
                
                {/* If there are more replies, show "Show more" button and scroll container */}
                {replyCount > MAX_VISIBLE_REPLIES && (
                  <div className="mt-2">
                    <details className="group">
                      <summary className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer list-none flex items-center gap-1 mb-2">
                        <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                        Show {replyCount - MAX_VISIBLE_REPLIES} more {replyCount - MAX_VISIBLE_REPLIES === 1 ? "reply" : "replies"}
                      </summary>
                      <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                        {comment.replies?.slice(MAX_VISIBLE_REPLIES).map((reply) => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            onDelete={onDelete}
                            currentUserId={currentUserId}
                            isInstanceOwner={isInstanceOwner}
                            depth={depth + 1}
                          />
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                {comment.replies?.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onDelete={onDelete}
                    currentUserId={currentUserId}
                    isInstanceOwner={isInstanceOwner}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};