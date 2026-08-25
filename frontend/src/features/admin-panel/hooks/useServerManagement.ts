import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import { queryKeys } from "@/lib/query/queryKeys";
import type {
  ServerStateResponse,
  ServerTaskType,
  SiteStatus,
} from "../types/adminPanelTypes";

const SERVER_STATE_KEYS = () => queryKeys.admin.server.state();
const SITE_STATUS_KEYS = () => queryKeys.siteStatus.current();

/** Admin: server operational state. Polls fast while a task is running */
export const useServerState = () => {
  return useQuery({
    queryKey: SERVER_STATE_KEYS(),
    queryFn: adminApi.getServerState,
    refetchInterval: (query) =>
      (query.state.data as ServerStateResponse | undefined)?.task?.status ===
      "running"
        ? 4000
        : 30000,
    staleTime: 4000,
    retry: 1,
  });
};

/** Public: maintenance flag consumed by the frontend gate */
export const useSiteStatus = () => {
  return useQuery({
    queryKey: SITE_STATUS_KEYS(),
    queryFn: adminApi.getSiteStatus,
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 1,
  });
};

/** Admin: start a maintenance task */
export const useStartServerTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      options,
    }: {
      type: ServerTaskType;
      options?: { delay?: number; limit?: number };
    }) => adminApi.startServerTask(type, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVER_STATE_KEYS() });
    },
  });
};

/** Admin: cancel the running task */
export const useCancelServerTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.cancelServerTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVER_STATE_KEYS() });
    },
  });
};

/** Admin: manually toggle maintenance mode */
export const useSetServerMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enabled, message }: { enabled: boolean; message?: string | null }) =>
      adminApi.setServerMaintenance(enabled, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVER_STATE_KEYS() });
      queryClient.invalidateQueries({ queryKey: SITE_STATUS_KEYS() });
    },
  });
};

/** Admin: restart the backend (production only) */
export const useRestartServer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.restartServer(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVER_STATE_KEYS() });
    },
  });
};

/** For the maintenance gate: normalize status data (errors -> not in maintenance) */
export const isSiteInMaintenance = (status?: SiteStatus | null): boolean => {
  return Boolean(status?.maintenance);
};