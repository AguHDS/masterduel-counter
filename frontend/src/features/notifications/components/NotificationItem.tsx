import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { X } from "lucide-react";
import type { Notification } from "../types/notification.types";
import { useNotifications } from "../context/useNotifications";
import {
  formatNotificationMessage,
  getNotificationLink,
  formatTimeAgo,
} from "../types/notification.types";

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const navigate = useNavigate();
  const { markAsRead, setShowNotifications } = useNotifications();

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    const link = getNotificationLink(notification);
    if (link) {
      setShowNotifications(false);
      navigate(link);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  const messageData = formatNotificationMessage(notification);
  const timeAgo = formatTimeAgo(notification.createdAt);
  const link = getNotificationLink(notification);

  const renderMessage = () => {
    const titleElement = messageData.link ? (
      <Link
        to={messageData.link}
        className="text-[#c2901c] hover:text-[#d4a730] underline font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        {messageData.title}
      </Link>
    ) : (
      <span className="font-medium">{messageData.title}</span>
    );

    if (messageData.actorName) {
      return (
        <>
          <span className="font-medium">{messageData.actorName}</span>{" "}
          {messageData.actionText} {titleElement}
        </>
      );
    }

    return (
      <>
        {messageData.actionText} {titleElement}
      </>
    );
  };

  return (
    <div
      className={`relative p-3 border-b border-[#c2901c]/10 hover:bg-[#2a2430] transition-colors group ${
        !notification.read ? "bg-[#2a2430]/50" : ""
      } ${link ? "cursor-pointer" : ""}`}
      onClick={link ? handleClick : undefined}
    >
      <div className="pr-6">
        <p className="text-sm text-gray-200">{renderMessage()}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>
      {!notification.read && (
        <button
          onClick={handleMarkAsRead}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Mark as read"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
