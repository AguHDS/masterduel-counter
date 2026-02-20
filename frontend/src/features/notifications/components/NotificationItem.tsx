import React from "react";
import type { Notification } from "../types/notification.types";
import { useNotifications } from "../context/useNotifications";

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const { markAsRead } = useNotifications();

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Aquí puedes agregar lógica de navegación si la notificación tiene un link
    if (notification.link) {
      // navigate(notification.link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 border-b border-[#c2901c]/10 hover:bg-[#2a2430] transition-colors cursor-pointer ${
        !notification.read ? "bg-[#2a2430]/50" : ""
      }`}
    >
      <p className="text-sm text-gray-200">{notification.message}</p>
      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
    </div>
  );
};
