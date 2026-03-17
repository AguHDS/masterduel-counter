import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import { queryKeys } from "@/lib/query/queryKeys";

/** Search users */
export const useSearchUsers = (query: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: [...queryKeys.admin.users.all, "search", query],
    queryFn: () => adminApi.searchUsers(query),
    enabled: enabled && !!query.trim(),
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

/** Get total users count */
export const useTotalUsers = () => {
  return useQuery({
    queryKey: ["admin", "totalUsers"],
    queryFn: () => adminApi.getTotalUsers(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

/** Get all users with pagination (infinite query for lazy loading) */
export const useAllUsers = (
  limit: number = 50,
  sortBy: string = "created_at",
  sortOrder: string = "desc",
  search?: string,
) => {
  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.admin.users.all,
      "paginated",
      sortBy,
      sortOrder,
      search,
    ],
    queryFn: ({ pageParam = 1 }) =>
      adminApi.getAllUsers(pageParam, limit, sortBy, sortOrder, search),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
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

      queryClient.removeQueries({
        queryKey: queryKeys.admin.users.detail(userId),
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
    queryFn: () => adminApi.getUserInstances(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

/** Delete user guide */
export const useDeleteUserGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, guideId }: { userId: string; guideId: string }) =>
      adminApi.deleteUserGuide(userId, guideId),
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

/** Change user role */
export const useChangeUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.changeUserRole(userId, role),
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
    }) => adminApi.banUser(userId, reason, expiresAt),
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
