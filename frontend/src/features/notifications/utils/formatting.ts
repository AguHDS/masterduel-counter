import { buildGuidePath } from "@/lib/config/urlHelpers";
import type { Notification, FormattedNotificationMessage } from "../types/notification.types";

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
    case "guide_request_fulfilled":
      return {
        actorName: notification.actorName,
        actionText: "fulfilled your guide request:",
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
  if (!notification.instanceId) return null;

  return buildGuidePath({
    guideId: notification.instanceId,
    archetypeId: notification.archetypeId,
    archetypeName: notification.archetypeName,
    userName: notification.instanceAuthorName,
    guideType: notification.guideType,
  });
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
