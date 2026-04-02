import React, { useState, useRef, useEffect } from "react";
import { NotificationContext } from "./NotificationContext";
import type { Notification } from "../types/notification.types";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsRead,
  useMarkAllAsRead,
} from "../hooks/useNotifications";
import { useAuth } from "@/features/auth";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement | HTMLButtonElement>(null);

  const { isAuthenticated } = useAuth();

  // Only fetch notifications if authenticated
  const { data: notificationsData } = useNotificationsQuery(1, 20, {
    enabled: isAuthenticated,
  });

  const { data: unreadCountData } = useUnreadCountQuery({
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications: Notification[] = notificationsData?.notifications || [];
  const unreadCount = unreadCountData || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        buttonRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [showNotifications]);

  const markAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showNotifications,
        setShowNotifications,
        markAsRead,
        markAllAsRead,
        notificationRef,
        buttonRef,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
