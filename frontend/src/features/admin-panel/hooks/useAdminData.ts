import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import { queryKeys } from "../../../lib/query/queryKeys";

// ========== HOOKS PARA USUARIO ESPECÍFICO (SEARCH) ==========
export const useAdminUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.admin.users.detail(userId),
    queryFn: () => adminApi.getUser(userId),
    enabled: !!userId, // Solo ejecuta si hay userId
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ========== HOOKS PARA REPORTES ==========
export const useAdminReports = () => {
  return useQuery({
    queryKey: queryKeys.admin.reports.list(),
    queryFn: adminApi.getReports,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  });
};

// ========== HOOKS PARA MUTACIONES ==========
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });
    },
  });
};

export const useUserInstances = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.admin.users.instances(userId),
    queryFn: () => adminApi.getUserInstances(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useDeleteUserInstance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      instanceId,
    }: {
      userId: string;
      instanceId: string;
    }) => adminApi.deleteUserInstance(userId, instanceId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.instances(userId),
      });
    },
  });
};

export const useChangeUserCredentials = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      credentials,
    }: {
      userId: string;
      credentials: { email?: string; username?: string; password?: string };
    }) => adminApi.changeUserCredentials(userId, credentials),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.banUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.unbanUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => adminApi.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.reports.list(),
      });
    },
  });
};

export const useAdminData = () => {
  const reportsQuery = useAdminReports();

  const loading = reportsQuery.isLoading;
  const error = reportsQuery.error;

  const refetchAll = () => {
    reportsQuery.refetch();
  };

  return {
    reports: reportsQuery.data || [],
    loading,
    error: error as Error | null,
    refetch: refetchAll,
    refetchReports: reportsQuery.refetch,
  };
};
