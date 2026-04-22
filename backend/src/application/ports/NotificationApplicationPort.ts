import {
  Notification,
  NotificationWithDetails,
  NotificationType,
} from "@/domain/Notification.js";

export interface NotificationApplicationPort {
  /** Create a comment notification */
  createCommentNotification(
    guideOwnerId: string,
    instanceId: number,
    commentId: number,
    commentorId: string,
    commentorName: string,
  ): Promise<Notification | null>;

  /** Create or update aggregated like notification */
  createOrUpdateLikeNotification(
    guideOwnerId: string,
    instanceId: number,
  ): Promise<Notification>;

  /** Create or update aggregated favorite notification */
  createOrUpdateFavoriteNotification(
    guideOwnerId: string,
    instanceId: number,
  ): Promise<Notification>;

  /** Decrement or delete aggregated notification (when like/favorite is removed) */
  decrementOrDeleteAggregatedNotification(
    guideOwnerId: string,
    instanceId: number,
    type: NotificationType,
  ): Promise<void>;

  /** Get user's notifications with pagination */
  getUserNotifications(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ notifications: NotificationWithDetails[]; total: number }>;

  /** Get unread notification count */
  getUnreadCount(userId: string): Promise<number>;

  /** Mark notification as read */
  markNotificationAsRead(notificationId: number, userId: string): Promise<Notification>;

  /** Mark all notifications as read */
  markAllAsRead(userId: string): Promise<void>;

  /** Create a notification when a guide request is fulfilled */
  createGuideRequestFulfilledNotification(
    requesterId: string,
    fulfilledInstanceId: number,
    fulfillerName: string,
  ): Promise<void>;
}
