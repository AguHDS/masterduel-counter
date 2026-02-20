import React, { useState, useRef, useEffect } from "react";
import { NotificationContext } from "./NotificationContext";
import type { Notification } from "../types/notification.types";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "like",
      message: "A user liked your deck",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      type: "comment",
      message: "New comment on your deck",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "follow",
      message: "Someone started following you",
      time: "3 hours ago",
      read: true,
    },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLImageElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Cerrar el popup al hacer click fuera
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = (id: string | number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "time" | "read">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      time: "Just now",
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
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
        addNotification,
        notificationRef,
        buttonRef,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
