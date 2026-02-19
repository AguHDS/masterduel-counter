import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/queryKeys";
import * as commentsApi from "../api/commentsApi";
import type {
  CreateCommentRequest,
  UpdateCommentRequest,
  Comment,
} from "../api/commentsApi";

interface UseCommentsParams {
  instanceId: number;
  enabled?: boolean;
}

interface UseCommentMutationsParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Helper to organize comments into a tree structure
const buildCommentTree = (comments: Comment[]): Comment[] => {
  const commentMap = new Map<number, any>();
  const rootComments: any[] = [];

  // First pass: create map of all comments
  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    });
  });

  // Second pass: organize into tree
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id);
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies.push(commentWithReplies);
      } else {
        // Orphaned reply (shouldn't happen), treat as root
        rootComments.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
};

export const useComments = ({
  instanceId,
  enabled = true,
}: UseCommentsParams) => {
  return useQuery({
    queryKey: queryKeys.comments.list(instanceId),
    queryFn: async () => {
      const response = await commentsApi.getInstanceComments(
        instanceId,
        1,
        100,
      );
      return {
        ...response,
        comments: buildCommentTree(response.comments),
      };
    },
    enabled: enabled && !!instanceId,
  });
};

export const useCommentMutations = ({
  onSuccess,
  onError,
}: UseCommentMutationsParams = {}) => {
  const queryClient = useQueryClient();

  const createComment = useMutation({
    mutationFn: (data: CreateCommentRequest) => commentsApi.createComment(data),

    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.comments.list(newComment.instanceId),
      });

      const previousData = queryClient.getQueryData(
        queryKeys.comments.list(newComment.instanceId),
      );

      queryClient.setQueryData(
        queryKeys.comments.list(newComment.instanceId),
        (old: any) => {
          if (!old) return old;

          const tempId = Date.now();
          const optimisticComment = {
            id: tempId,
            content: newComment.content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            instanceId: newComment.instanceId,
            parentCommentId: newComment.parentCommentId,
            authorId: "temp",
            author: {
              id: "temp",
              name: "You",
              email: "",
              image: null,
            },
            replies: [],
          };

          // If it's a reply, add it to the parent's replies
          if (newComment.parentCommentId) {
            const updateCommentTree = (comments: any[]): any[] => {
              return comments.map((c) => {
                if (c.id === newComment.parentCommentId) {
                  return {
                    ...c,
                    replies: [...(c.replies || []), optimisticComment],
                  };
                }
                if (c.replies?.length) {
                  return {
                    ...c,
                    replies: updateCommentTree(c.replies),
                  };
                }
                return c;
              });
            };

            return {
              ...old,
              comments: updateCommentTree(old.comments || []),
              total: (old.total || 0) + 1,
            };
          }

          // If it's a root comment, add to the top
          return {
            ...old,
            comments: [optimisticComment, ...(old.comments || [])],
            total: (old.total || 0) + 1,
          };
        },
      );

      return { previousData };
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(variables.instanceId),
      });
      onSuccess?.();
    },

    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.comments.list(variables.instanceId),
          context.previousData,
        );
      }
      onError?.(err);
    },
  });

  const updateComment = useMutation({
    mutationFn: ({ commentId, content }: UpdateCommentRequest) =>
      commentsApi.updateComment(commentId, content),

    onMutate: async ({ commentId, content }) => {
      let instanceId: number | null = null;
      const queries = queryClient.getQueriesData({
        queryKey: queryKeys.comments.lists(),
      });

      for (const [, data] of queries) {
        const commentsData = data as any;
        const findComment = (comments: any[]): any => {
          for (const c of comments) {
            if (c.id === commentId) return c;
            if (c.replies?.length) {
              const found = findComment(c.replies);
              if (found) return found;
            }
          }
          return null;
        };

        if (commentsData?.comments) {
          const found = findComment(commentsData.comments);
          if (found) {
            instanceId = found.instanceId;
            break;
          }
        }
      }

      if (!instanceId) return {};

      await queryClient.cancelQueries({
        queryKey: queryKeys.comments.list(instanceId),
      });

      const previousData = queryClient.getQueryData(
        queryKeys.comments.list(instanceId),
      );

      const updateCommentInTree = (comments: any[]): any[] => {
        return comments.map((c) => {
          if (c.id === commentId) {
            return { ...c, content, updatedAt: new Date().toISOString() };
          }
          if (c.replies?.length) {
            return { ...c, replies: updateCommentInTree(c.replies) };
          }
          return c;
        });
      };

      queryClient.setQueryData(
        queryKeys.comments.list(instanceId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: updateCommentInTree(old.comments || []),
          };
        },
      );

      return { previousData, instanceId };
    },

    onSuccess: (updatedComment) => {
      queryClient.setQueryData(
        queryKeys.comments.detail(updatedComment.id),
        updatedComment,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(updatedComment.instanceId),
      });
      onSuccess?.();
    },

    onError: (err, _variables, context: any) => {
      if (context?.previousData && context?.instanceId) {
        queryClient.setQueryData(
          queryKeys.comments.list(context.instanceId),
          context.previousData,
        );
      }
      onError?.(err);
    },
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: number) => commentsApi.deleteComment(commentId),

    onMutate: async (commentId) => {
      let instanceId: number | null = null;
      const queries = queryClient.getQueriesData({
        queryKey: queryKeys.comments.lists(),
      });

      for (const [, data] of queries) {
        const commentsData = data as any;
        const findComment = (comments: any[]): any => {
          for (const c of comments) {
            if (c.id === commentId) return c;
            if (c.replies?.length) {
              const found = findComment(c.replies);
              if (found) return found;
            }
          }
          return null;
        };

        if (commentsData?.comments) {
          const found = findComment(commentsData.comments);
          if (found) {
            instanceId = found.instanceId;
            break;
          }
        }
      }

      if (!instanceId) return {};

      await queryClient.cancelQueries({
        queryKey: queryKeys.comments.list(instanceId),
      });

      const previousData = queryClient.getQueryData(
        queryKeys.comments.list(instanceId),
      );

      const deleteCommentFromTree = (comments: any[]): any[] => {
        return comments
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies?.length ? deleteCommentFromTree(c.replies) : [],
          }));
      };

      queryClient.setQueryData(
        queryKeys.comments.list(instanceId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: deleteCommentFromTree(old.comments || []),
            total: (old.total || 0) - 1,
          };
        },
      );

      return { previousData, instanceId };
    },

    onSuccess: (_, commentId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.comments.detail(commentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.lists(),
      });
      onSuccess?.();
    },

    onError: (err, _commentId, context: any) => {
      if (context?.previousData && context?.instanceId) {
        queryClient.setQueryData(
          queryKeys.comments.list(context.instanceId),
          context.previousData,
        );
      }
      onError?.(err);
    },
  });

  return {
    createComment,
    updateComment,
    deleteComment,
  };
};
