export type NotificationType = "comment" | "like" | "favorite" | "guide_request_fulfilled";

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
  archetypeName?: string;
  instanceAuthorName?: string;
  guideType?: "COUNTER" | "DECK";
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
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export interface FormattedNotificationMessage {
  actorName: string | null;
  actionText: string;
  title: string;
  link: string | null;
}
