import React from "react";
import { useNotifications } from "../context/useNotifications";
import { NotificationItem } from "./NotificationItem";

interface NotificationPopupProps {
  isMobile?: boolean;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isMobile = false,
}) => {
  const { notifications, showNotifications, markAllAsRead, notificationRef } =
    useNotifications();

  if (!showNotifications) return null;

  if (isMobile) {
    return (
      <div
        ref={notificationRef}
        className="mt-2 bg-[#2a2430] rounded-lg border border-[#c2901c]/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-[#c2901c]/30">
          <h3 className="text-white font-semibold text-sm">Notifications</h3>
        </div>

        <div className="max-h-64 overflow-y-auto scrollbar-cardpair">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-400 text-sm">
              No notifications
            </div>
          )}
        </div>

        <div className="p-2 border-t border-[#c2901c]/30 bg-[#151017]">
          <button
            className="w-full text-center text-sm text-[#c2901c] hover:text-[#d4a534] transition-colors py-1"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={notificationRef}
      className="absolute right-0 mt-2 w-80 bg-[#1f1a24] border border-[#c2901c]/30 rounded-lg shadow-xl overflow-hidden z-50"
      style={{ top: "100%" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3 border-b border-[#c2901c]/30">
        <h3 className="text-white font-semibold">Notifications</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-400">No notifications</div>
        )}
      </div>

      <div className="p-2 border-t border-[#c2901c]/30 bg-[#151017]">
        <button
          className="w-full text-center text-sm text-[#c2901c] hover:text-[#d4a534] transition-colors py-1"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};
