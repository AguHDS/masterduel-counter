import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

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
  archetypeName?: string;
  instanceAuthorName?: string;
  guideType?: "COUNTER" | "DECK";
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  total: number;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

export const notificationsApi = {
  /** Get user notifications with pagination */
  getNotifications: async (
    page: number = 1,
    limit: number = 20,
  ): Promise<NotificationsResponse> => {
    const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
      params: { page, limit },
      withCredentials: true,
    });
    return response.data;
  },

  /** Get unread notification count */
  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get<UnreadCountResponse>(
      `${API_BASE_URL}/api/notifications/unread-count`,
      { withCredentials: true },
    );
    return response.data.count;
  },

  /** Mark a notification as read */
  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await axios.patch(
      `${API_BASE_URL}/api/notifications/${notificationId}/read`,
      {},
      { withCredentials: true },
    );
    return response.data.notification;
  },

  /** Mark all notifications as read */
  markAllAsRead: async (): Promise<void> => {
    await axios.patch(
      `${API_BASE_URL}/api/notifications/read-all`,
      {},
      { withCredentials: true },
    );
  },
};
