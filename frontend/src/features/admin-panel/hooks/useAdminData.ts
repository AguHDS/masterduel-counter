import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api";
import { queryKeys } from "../../../lib/query/queryKeys";

// ========== HOOKS PARA USUARIOS ==========
export const useAdminUsers = () => {
  return useQuery({
    queryKey: queryKeys.admin.users.list(),
    queryFn: adminApi.getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (cache)
  });
};

export const useUserInstances = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.admin.users.instances(userId),
    queryFn: () => adminApi.getUserInstances(userId),
    enabled: !!userId, // Solo ejecuta si hay un userId
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.list() });
    },
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.list(),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.list() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.list() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });
    },
  });
};

// ========== HOOKS PARA REPORTES ==========
export const useAdminReports = () => {
  return useQuery({
    queryKey: queryKeys.admin.reports.list(),
    queryFn: adminApi.getReports,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos
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

// ========== HOOK COMBINADO (backward compatibility) ==========
export const useAdminData = () => {
  const usersQuery = useAdminUsers();
  const reportsQuery = useAdminReports();

  const loading = usersQuery.isLoading || reportsQuery.isLoading;
  const error = usersQuery.error || reportsQuery.error;

  const refetchAll = () => {
    usersQuery.refetch();
    reportsQuery.refetch();
  };

  return {
    users: usersQuery.data || [],
    reports: reportsQuery.data || [],
    loading,
    error: error as Error | null,
    refetch: refetchAll,
    refetchUsers: usersQuery.refetch,
    refetchReports: reportsQuery.refetch,
  };
};