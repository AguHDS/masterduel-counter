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
  createdAt: string;
  updatedAt: string;
  instanceTitle?: string;
  archetypeId?: number;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  notificationRef: React.RefObject<HTMLDivElement | null>;
  buttonRef: React.RefObject<HTMLDivElement | HTMLButtonElement | null>;
}

export interface FormattedNotificationMessage {
  actorName: string | null;
  actionText: string;
  title: string;
  link: string | null;
}

/** Format notification message data */
export const formatNotificationMessage = (notification: Notification): FormattedNotificationMessage => {
  const title = notification.instanceTitle || "your guide";
  const link = getNotificationLink(notification);

  switch (notification.type) {
    case "comment":
      return {
        actorName: notification.actorName,
        actionText: "has commented on",
        title,
        link,
      };
    case "like":
      if (notification.count === 1) {
        return {
          actorName: null,
          actionText: "1 user liked your guide:",
          title,
          link,
        };
      }
      return {
        actorName: null,
        actionText: `${notification.count} users liked your guide:`,
        title,
        link,
      };
    case "favorite":
      if (notification.count === 1) {
        return {
          actorName: null,
          actionText: "1 user favorited your guide:",
          title,
          link,
        };
      }
      return {
        actorName: null,
        actionText: `${notification.count} users favorited your guide:`,
        title,
        link,
      };
    default:
      return {
        actorName: null,
        actionText: "New notification",
        title: "",
        link: null,
      };
  }
};

/** Get notification link */
export const getNotificationLink = (notification: Notification): string | null => {
  if (!notification.archetypeId || !notification.instanceId) return null;
  return `/archetype/${notification.archetypeId}/instance/${notification.instanceId}`;
};

/** Format time ago */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
};