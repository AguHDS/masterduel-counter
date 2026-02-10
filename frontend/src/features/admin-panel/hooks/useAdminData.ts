import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import { queryKeys } from "@/lib/query/queryKeys";

/** Search users */
export const useSearchUsers = (query: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: [...queryKeys.admin.users.all, "search", query],
    queryFn: () => adminApi.searchUsers(query),
    enabled: enabled && !!query.trim(), // Only run if there is a query and enabled is true
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/** Get a specific user */
export const useAdminUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.admin.users.detail(userId),
    queryFn: () => adminApi.getUser(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/** Get admin reports */
export const useAdminReports = () => {
  return useQuery({
    queryKey: queryKeys.admin.reports.list(),
    queryFn: adminApi.getReports,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  });
};

/** Delete user */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
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
    onError: (error: any) => {
      console.error("Delete user error:", error);
    },
  });
};

/** Get user instances */
export const useUserInstances = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.admin.users.instances(userId),
    queryFn: () => adminApi.getUserInstances(userId),
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
    }) => adminApi.deleteUserInstance(userId, instanceId),
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
    }) => adminApi.changeUserCredentials(userId, credentials),
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
    mutationFn: (userId: string) => adminApi.banUser(userId),
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

/** Unban user */
export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.unbanUser(userId),
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
    mutationFn: (reportId: string) => adminApi.deleteReport(reportId),
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
