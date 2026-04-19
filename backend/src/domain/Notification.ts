export type NotificationType = "comment" | "like" | "favorite";

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  read: boolean;
  count: number;
  instanceId: number | null;
  commentId: number | null;
  actorId: string | null;
  actorName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationWithDetails extends Notification {
  instanceTitle?: string;
  archetypeId?: number;
  archetypeName?: string;
  instanceAuthorName?: string;
  guideType?: "COUNTER" | "DECK";
}

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  instanceId?: number;
  commentId?: number;
  actorId?: string;
  actorName?: string;
}

export interface UpdateNotificationDTO {
  read?: boolean;
  count?: number;
}
