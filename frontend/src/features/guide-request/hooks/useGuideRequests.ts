import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/queryKeys";
import { guideRequestApi } from "../api/guideRequestApi";
import type {
  GuideRequest,
  GuideRequestCounts,
  GuideRequestListResult,
  CreateGuideRequestPayload,
} from "../types/guideRequest.types";

export function useGuideRequests(
  page: number,
  limit: number,
  status?: string,
): UseQueryResult<GuideRequestListResult> {
  return useQuery({
    queryKey: queryKeys.guideRequests.list(page, limit, status),
    queryFn: () => guideRequestApi.getRequests(page, limit, status),
  });
}

export function useRecentGuideRequests(
  limit: number,
): UseQueryResult<GuideRequest[]> {
  return useQuery({
    queryKey: queryKeys.guideRequests.recent(limit),
    queryFn: () => guideRequestApi.getRecentRequests(limit),
    staleTime: 60_000,
  });
}

export function useGuideRequestById(
  id: number | null,
): UseQueryResult<GuideRequest> {
  return useQuery({
    queryKey: queryKeys.guideRequests.detail(id!),
    queryFn: () => guideRequestApi.getRequestById(id!),
    enabled: id !== null,
  });
}

export function useCreateGuideRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGuideRequestPayload) =>
      guideRequestApi.createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guideRequests.all });
    },
  });
}

export function useTakeGuideRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => guideRequestApi.takeRequest(requestId),
    onSuccess: (_data, requestId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guideRequests.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.guideRequests.detail(requestId),
      });
    },
  });
}

export function useCancelTakeGuideRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) =>
      guideRequestApi.cancelTakeRequest(requestId),
    onSuccess: (_data, requestId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guideRequests.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.guideRequests.detail(requestId),
      });
    },
  });
}

export function useFulfillGuideRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      instanceId,
    }: {
      requestId: number;
      instanceId: number;
    }) => guideRequestApi.fulfillRequest(requestId, instanceId),
    onSuccess: (_data, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guideRequests.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.guideRequests.detail(requestId),
      });
    },
  });
}

export function useGuideRequestCounts(): UseQueryResult<GuideRequestCounts> {
  return useQuery({
    queryKey: queryKeys.guideRequests.counts,
    queryFn: () => guideRequestApi.getRequestCounts(),
    staleTime: 30_000,
  });
}
