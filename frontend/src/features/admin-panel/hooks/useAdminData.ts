import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminHttpApi } from "@/lib/http/adminApi";
import { queryKeys } from "@/lib/query/queryKeys";

/** Search users */
export const useSearchUsers = (query: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: [...queryKeys.admin.users.all, "search", query],
    queryFn: () => adminHttpApi.searchUsers(query),
    enabled: enabled && !!query.trim(), // Only run if there is a query and enabled is true
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/** Get a specific user */
export const useAdminUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.admin.users.detail(userId),
    queryFn: () => adminHttpApi.getUser(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/** Get admin reports */
export const useAdminReports = () => {
  return useQuery({
    queryKey: queryKeys.admin.reports.list(),
    queryFn: adminHttpApi.getReports,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  });
};

/** Delete user */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminHttpApi.deleteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.admin.users.all, "search"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.all,
      });

      // Remove user data from cache to prevent showing deleted user details
      queryClient.removeQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });

      queryClient.invalidateQueries({
        queryKey: [...queryKeys.admin.users.all, "search"],
      });
    },
    onError: (error: Error) => {
      console.error("Delete user error:", error);
    },
  });
};

/** Get user instances */
export const useUserInstances = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.admin.users.instances(userId),
    queryFn: () => adminHttpApi.getUserInstances(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

/** Delete user instance */
export const useDeleteUserInstance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      instanceId,
    }: {
      userId: string;
      instanceId: string;
    }) => adminHttpApi.deleteUserInstance(userId, instanceId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.instances(userId),
      });
    },
  });
};

/** Change user credentials */
export const useChangeUserCredentials = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      credentials,
    }: {
      userId: string;
      credentials: { email?: string; username?: string; password?: string };
    }) => adminHttpApi.changeUserCredentials(userId, credentials),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.admin.users.all, "search"],
      });
    },
  });
};

/** Change user role */
export const useChangeUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminHttpApi.changeUserRole(userId, role),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.admin.users.all, "search"],
      });
    },
  });
};

/** Ban user */
export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      reason,
      expiresAt,
    }: {
      userId: string;
      reason: string;
      expiresAt?: string | null;
    }) => adminHttpApi.banUser(userId, reason, expiresAt),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.admin.users.all, "search"],
      });
    },
  });
};

/** Unban user */
export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminHttpApi.unbanUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(userId),
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.admin.users.all, "search"],
      });
    },
  });
};

/** Delete a report */
export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => adminHttpApi.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.reports.list(),
      });
    },
  });
};

/** Main hook to manage admin data */
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
