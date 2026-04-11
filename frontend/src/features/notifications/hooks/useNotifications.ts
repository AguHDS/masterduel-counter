import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { notificationsApi } from "../api/notificationsApi";
import type { Notification } from "../api/notificationsApi";

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (page: number) => [...notificationKeys.lists(), page] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

/** Hook to get user notifications with pagination */
export const useNotificationsQuery = (
  page: number = 1, 
  limit: number = 15,
  options?: Omit<UseQueryOptions<NotificationsResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: notificationKeys.list(page),
    queryFn: () => notificationsApi.getNotifications(page, limit),
    staleTime: 30000, // 30 seconds
    ...options,
  });
};

/** Hook to get unread notification count */
export const useUnreadCountQuery = (
  options?: Omit<UseQueryOptions<number>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options,
  });
};

/** Hook to mark a notification as read */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationsApi.markAsRead(notificationId),
    onSuccess: (updatedNotification) => {
      // Optimistically mark the notification as read in the list (keep it visible)
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (oldData: NotificationsResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            notifications: oldData.notifications.map((n: Notification) =>
              n.id === updatedNotification.id ? { ...n, read: true } : n
            ),
          };
        }
      );

      // Update unread count only if the notification was unread before
      if (!updatedNotification.read) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          (oldCount: number = 0) => Math.max(0, oldCount - 1)
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/** Hook to mark all notifications as read */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      // Optimistically mark all notifications as read (keep them visible)
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (oldData: NotificationsResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            notifications: oldData.notifications.map((n: Notification) => ({
              ...n,
              read: true,
            })),
          };
        }
      );

      // Set unread count to 0
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
