import { Router } from "express";
import { Dependencies } from "@/compositionRoot.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import { createGetNotificationsController } from "@/http/controllers/notifications/getNotificationsController.js";
import { createGetUnreadCountController } from "@/http/controllers/notifications/getUnreadCountController.js";
import { createMarkAsReadController } from "@/http/controllers/notifications/markAsReadController.js";
import { createMarkAllAsReadController } from "@/http/controllers/notifications/markAllAsReadController.js";

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
