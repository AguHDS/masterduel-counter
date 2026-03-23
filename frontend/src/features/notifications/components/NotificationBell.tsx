import React from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../context/useNotifications";

interface NotificationBellProps {
  isMobile?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  isMobile = false,
}) => {
  const { unreadCount, showNotifications, setShowNotifications, buttonRef } =
    useNotifications();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  if (isMobile) {
    return (
      <button
        ref={buttonRef as React.RefObject<HTMLButtonElement>}
        onClick={handleClick}
        className="flex items-center gap-2 text-[#c2901c] text-sm font-medium hover:opacity-80 transition-opacity py-2 w-full text-left"
      >
        <div className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <span>
          Notifications
          {unreadCount > 0 && ` (${unreadCount})`}
        </span>
      </button>
    );
  }

  return (
    <div ref={buttonRef as React.RefObject<HTMLDivElement>} className="relative" onClick={handleClick}>
      <Bell
        className={`h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity text-[#c2901c]`}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 left-4 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
};