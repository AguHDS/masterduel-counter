export type NotificationType = "like" | "comment" | "follow" | "system";

export interface Notification {
  id: string | number;
  type: NotificationType;
  message: string;
  time: string;
  read: boolean;
  userId?: string;
  link?: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "time" | "read">,
  ) => void;
  notificationRef: React.RefObject<HTMLDivElement | null>;
  buttonRef: React.RefObject<HTMLImageElement | null>;
}
