import React from "react";
import notificationImg from "../../../assets/notification-icon.webp";
import { useNotifications } from "../context/useNotifications";

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = "",
}) => {
  const { unreadCount, showNotifications, setShowNotifications, buttonRef } =
    useNotifications();

  return (
    <div className="relative">
      <img
        ref={buttonRef}
        src={notificationImg}
        alt="Notifications"
        className={`h-6 w-6 mr-3 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        onClick={() => setShowNotifications(!showNotifications)}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 left-4 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
};
