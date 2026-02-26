import { Router } from "express";
import { Dependencies } from "@/compositionRoot";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware";
import { createGetNotificationsController } from "@/http/controllers/notifications/getNotificationsController";
import { createGetUnreadCountController } from "@/http/controllers/notifications/getUnreadCountController";
import { createMarkAsReadController } from "@/http/controllers/notifications/markAsReadController";
import { createMarkAllAsReadController } from "@/http/controllers/notifications/markAllAsReadController";

export function createNotificationsRoute(dependencies: Dependencies) {
  const router = Router();
  const notificationService = dependencies.getNotificationService();

  // Get user's notifications (with pagination)
  router.get(
    "/",
    requireAuth,
    createGetNotificationsController(notificationService),
  );

  // Get unread notification count
  router.get(
    "/unread-count",
    requireAuth,
    createGetUnreadCountController(notificationService),
  );

  // Mark specific notification as read
  router.patch(
    "/:id/read",
    requireAuth,
    createMarkAsReadController(notificationService),
  );

  // Mark all notifications as read
  router.patch(
    "/read-all",
    requireAuth,
    createMarkAllAsReadController(notificationService),
  );

  return router;
}
