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

export const useComments = ({
  instanceId,
  enabled = true,
}: UseCommentsParams) => {
  return useQuery({
    queryKey: queryKeys.comments.list(instanceId),
    queryFn: () => commentsApi.getInstanceComments(instanceId, 1, 50),
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

      const previousComments = queryClient.getQueryData(
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
            authorId: "temp",
            author: {
              id: "temp",
              name: "You",
              email: "",
              image: null,
            },
          };
          return {
            ...old,
            comments: [optimisticComment, ...(old.comments || [])],
            total: (old.total || 0) + 1,
          };
        },
      );

      return { previousComments };
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(variables.instanceId),
      });
      onSuccess?.();
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.comments.list(variables.instanceId),
          context.previousComments,
        );
      }
      onError?.(err);
    },
  });

  const updateComment = useMutation({
    mutationFn: ({ commentId, content }: UpdateCommentRequest) =>
      commentsApi.updateComment(commentId, content),

    onMutate: async ({ commentId, content }) => {
      // Find which instance this comment belongs to
      let instanceId: number | null = null;
      const queries = queryClient.getQueriesData({
        queryKey: queryKeys.comments.lists(),
      });

      for (const [, data] of queries) {
        const commentsData = data as any;
        const comment = commentsData?.comments?.find(
          (c: Comment) => c.id === commentId,
        );
        if (comment) {
          instanceId = comment.instanceId;
          break;
        }
      }

      if (!instanceId) return {};

      await queryClient.cancelQueries({
        queryKey: queryKeys.comments.list(instanceId),
      });

      const previousComments = queryClient.getQueryData(
        queryKeys.comments.list(instanceId),
      );

      queryClient.setQueryData(
        queryKeys.comments.list(instanceId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: old.comments.map((c: Comment) =>
              c.id === commentId
                ? { ...c, content, updatedAt: new Date().toISOString() }
                : c,
            ),
          };
        },
      );

      return { previousComments, instanceId };
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
      if (context?.previousComments && context?.instanceId) {
        queryClient.setQueryData(
          queryKeys.comments.list(context.instanceId),
          context.previousComments,
        );
      }
      onError?.(err);
    },
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: number) => commentsApi.deleteComment(commentId),

    onMutate: async (commentId) => {
      // Find which instance this comment belongs to
      let instanceId: number | null = null;
      const queries = queryClient.getQueriesData({
        queryKey: queryKeys.comments.lists(),
      });

      for (const [, data] of queries) {
        const commentsData = data as any;
        const comment = commentsData?.comments?.find(
          (c: Comment) => c.id === commentId,
        );
        if (comment) {
          instanceId = comment.instanceId;
          break;
        }
      }

      if (!instanceId) return {};

      await queryClient.cancelQueries({
        queryKey: queryKeys.comments.list(instanceId),
      });

      const previousComments = queryClient.getQueryData(
        queryKeys.comments.list(instanceId),
      );

      queryClient.setQueryData(
        queryKeys.comments.list(instanceId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: old.comments.filter((c: Comment) => c.id !== commentId),
            total: (old.total || 0) - 1,
          };
        },
      );

      return { previousComments, instanceId };
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
      if (context?.previousComments && context?.instanceId) {
        queryClient.setQueryData(
          queryKeys.comments.list(context.instanceId),
          context.previousComments,
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
