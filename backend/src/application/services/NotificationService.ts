import {
  Notification,
  NotificationWithDetails,
  CreateNotificationDTO,
  NotificationType,
} from "@/domain/Notification";
import { NotificationServicePort } from "@/application/ports/NotificationService";
import { NotificationRepository } from "@/domain/ports/NotificationRepository";

export class NotificationService implements NotificationServicePort {
  constructor(private notificationRepository: NotificationRepository) {}

  async createCommentNotification(
    guideOwnerId: string,
    instanceId: number,
    commentId: number,
    commentorId: string,
    commentorName: string,
  ): Promise<Notification | null> {
    // Don't notify users about their own comments
    if (guideOwnerId === commentorId) {
      return null;
    }

    const data: CreateNotificationDTO = {
      userId: guideOwnerId,
      type: "comment",
      instanceId,
      commentId,
      actorId: commentorId,
      actorName: commentorName,
    };

    return this.notificationRepository.createNotification(data);
  }

  async createOrUpdateLikeNotification(
    guideOwnerId: string,
    instanceId: number,
  ): Promise<Notification> {
    // Check if aggregated notification already exists
    const existing =
      await this.notificationRepository.findAggregatedNotification(
        guideOwnerId,
        instanceId,
        "like",
      );

    if (existing) {
      // Increment count and update timestamp
      return this.notificationRepository.updateNotification(existing.id, {
        count: existing.count + 1,
      });
    }

    // Create new notification
    const data: CreateNotificationDTO = {
      userId: guideOwnerId,
      type: "like",
      instanceId,
    };

    return this.notificationRepository.createNotification(data);
  }

  async createOrUpdateFavoriteNotification(
    guideOwnerId: string,
    instanceId: number,
  ): Promise<Notification> {
    // Check if aggregated notification already exists
    const existing =
      await this.notificationRepository.findAggregatedNotification(
        guideOwnerId,
        instanceId,
        "favorite",
      );

    if (existing) {
      // Increment count and update timestamp
      return this.notificationRepository.updateNotification(existing.id, {
        count: existing.count + 1,
      });
    }

    // Create new notification
    const data: CreateNotificationDTO = {
      userId: guideOwnerId,
      type: "favorite",
      instanceId,
    };

    return this.notificationRepository.createNotification(data);
  }

  async decrementOrDeleteAggregatedNotification(
    guideOwnerId: string,
    instanceId: number,
    type: NotificationType,
  ): Promise<void> {
    const existing =
      await this.notificationRepository.findAggregatedNotification(
        guideOwnerId,
        instanceId,
        type,
      );

    if (!existing) {
      return;
    }

    if (existing.count <= 1) {
      // Delete notification if count would reach 0
      await this.notificationRepository.deleteNotification(existing.id);
    } else {
      // Decrement count
      await this.notificationRepository.updateNotification(existing.id, {
        count: existing.count - 1,
      });
    }
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: NotificationWithDetails[]; total: number }> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 100) limit = 100;

    return this.notificationRepository.findNotificationsByUserId(
      userId,
      page,
      limit,
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(
    notificationId: number,
    userId: string,
  ): Promise<Notification> {
    const notification =
      await this.notificationRepository.findNotificationById(notificationId);

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new Error("You can only mark your own notifications as read");
    }

    return this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
