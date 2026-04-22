import React from "react";
import { useNotifications } from "../context/useNotifications";
import { NotificationItem } from "./NotificationItem";

interface NotificationPopupProps {
  isMobile?: boolean;
}

const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}> = ({ currentPage, totalPages, setCurrentPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 py-2 border-t border-[#c2901c]/20">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
        className="px-2 py-1 text-xs text-[#c2901c] disabled:opacity-30 hover:text-[#d4a534]"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`w-6 h-6 text-xs rounded ${
            page === currentPage
              ? "bg-[#c2901c] text-black font-bold"
              : "text-[#c2901c] hover:text-[#d4a534]"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
        className="px-2 py-1 text-xs text-[#c2901c] disabled:opacity-30 hover:text-[#d4a534]"
      >
        ›
      </button>
    </div>
  );
};

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isMobile = false,
}) => {
  const {
    notifications,
    showNotifications,
    markAllAsRead,
    notificationRef,
    currentPage,
    totalPages,
    setCurrentPage,
  } = useNotifications();

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

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />

        <div className="p-2 border-t border-[#c2901c]/30 bg-[#151017]">
          <button
            className="w-full text-center text-sm text-[#c2901c] hover:text-[#d4a534] py-1"
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
      className="scrollbar-homeAllPages absolute right-0 mt-2 w-80 bg-[#1f1a24] border border-[#c2901c]/30 rounded-lg shadow-xl overflow-hidden z-50"
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

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <div className="p-2 border-t border-[#c2901c]/30 bg-[#151017]">
        <button
          className="w-full text-center text-sm text-[#c2901c] hover:text-[#d4a534] py-1"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};
