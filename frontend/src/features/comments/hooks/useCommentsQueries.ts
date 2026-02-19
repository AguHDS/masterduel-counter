import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  commentsApi,
  type CreateCommentRequest,
  type UpdateCommentRequest,
} from "@/lib/http/commentsApi";
import { queryKeys } from "@/lib/query/queryKeys";

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
    queryFn: () => commentsApi.getInstanceComments({ instanceId, limit: 50 }),
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(variables.instanceId),
      });
      onSuccess?.();
    },
    onError,
  });

  const updateComment = useMutation({
    mutationFn: (data: UpdateCommentRequest) => commentsApi.updateComment(data),
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
    onError,
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: number) => commentsApi.deleteComment({ commentId }),
    onSuccess: (_, commentId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.comments.detail(commentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.lists(),
      });
      onSuccess?.();
    },
    onError,
  });

  return {
    createComment,
    updateComment,
    deleteComment,
  };
};
