import {
  Notification,
  NotificationWithDetails,
  CreateNotificationDTO,
  UpdateNotificationDTO,
  NotificationType,
} from "../Notification.js";

export interface NotificationRepository {
  /** Create a new notification */
  createNotification(data: CreateNotificationDTO): Promise<Notification>;

  /** Find notification by ID */
  findNotificationById(id: number): Promise<Notification | null>;

  /** Get all notifications for a user (with pagination) */
  findNotificationsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ notifications: NotificationWithDetails[]; total: number }>;

  /** Get unread notification count for a user */
  getUnreadCount(userId: string): Promise<number>;

  /** Mark notification as read */
  markNotificationAsRead(id: number): Promise<Notification>;

  /** Mark all notifications as read for a user */
  markAllAsRead(userId: string): Promise<void>;

  /** Update notification (e.g., increment count) */
  updateNotification(
    id: number,
    data: UpdateNotificationDTO,
  ): Promise<Notification>;

  /** Find existing aggregated notification for likes/favorites */
  findAggregatedNotification(
    userId: string,
    instanceId: number,
    type: NotificationType,
  ): Promise<Notification | null>;

  /** Delete notification */
  deleteNotification(id: number): Promise<void>;
}
