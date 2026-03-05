import Database from "better-sqlite3";
import { PrismaClient } from "@prisma/client";
import {
  Notification,
  NotificationWithDetails,
  CreateNotificationDTO,
  UpdateNotificationDTO,
  NotificationType,
} from "@/domain/Notification.js";
import { NotificationRepository } from "@/domain/ports/NotificationRepository.js";

export class SqliteNotificationRepository implements NotificationRepository {
  constructor(
    private db: Database.Database,
    private prisma: PrismaClient,
  ) {}

  async createNotification(
    data: CreateNotificationDTO,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        instanceId: data.instanceId || null,
        commentId: data.commentId || null,
        actorId: data.actorId || null,
        actorName: data.actorName || null,
      },
    });

    return this.mapToNotification(notification);
  }

  async findNotificationById(id: number): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) return null;

    return this.mapToNotification(notification);
  }

  async findNotificationsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ notifications: NotificationWithDetails[]; total: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          instance: {
            select: {
              id: true,
              title: true,
              archetypeId: true,
            },
          },
        },
      }),
      this.prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    const notificationsWithDetails: NotificationWithDetails[] =
      notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        type: n.type as NotificationType,
        read: n.read,
        count: n.count,
        instanceId: n.instanceId,
        commentId: n.commentId,
        actorId: n.actorId,
        actorName: n.actorName,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        instanceTitle: n.instance?.title,
        archetypeId: n.instance?.archetypeId,
      }));

    return { notifications: notificationsWithDetails, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    // Get the notification before deleting it
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    // Delete the notification
    await this.prisma.notification.delete({
      where: { id },
    });

    return this.mapToNotification(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { userId, read: false },
    });
  }

  async updateNotification(
    id: number,
    data: UpdateNotificationDTO,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        read: data.read,
        count: data.count,
      },
    });

    return this.mapToNotification(notification);
  }

  async findAggregatedNotification(
    userId: string,
    instanceId: number,
    type: NotificationType,
  ): Promise<Notification | null> {
    // Find unread notification of the same type for this instance
    const notification = await this.prisma.notification.findFirst({
      where: {
        userId,
        instanceId,
        type,
        read: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!notification) return null;

    return this.mapToNotification(notification);
  }

  async deleteNotification(id: number): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }

  private mapToNotification(data: {
    id: number;
    userId: string;
    type: string;
    read: boolean;
    count: number;
    instanceId: number | null;
    commentId: number | null;
    actorId: string | null;
    actorName: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Notification {
    return {
      id: data.id,
      userId: data.userId,
      type: data.type as NotificationType,
      read: data.read,
      count: data.count,
      instanceId: data.instanceId,
      commentId: data.commentId,
      actorId: data.actorId,
      actorName: data.actorName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
