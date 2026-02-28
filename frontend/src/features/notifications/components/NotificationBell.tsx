import React from "react";
import notificationImg from "@/assets/notification-icon.webp";
import { useNotifications } from "../context/useNotifications";

export const NotificationBell = () => {
  const { unreadCount, showNotifications, setShowNotifications, buttonRef } =
    useNotifications();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  return (
    <div ref={buttonRef} className="relative" onClick={handleClick}>
      <img
        src={notificationImg}
        alt="Notifications"
        className={`h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity`}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 left-4 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
};
