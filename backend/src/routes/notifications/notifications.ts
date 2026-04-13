import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import { createGetNotificationsController } from "@/http/controllers/notifications/getNotificationsController.js";
import { createGetUnreadCountController } from "@/http/controllers/notifications/getUnreadCountController.js";
import { createMarkAsReadController } from "@/http/controllers/notifications/markAsReadController.js";
import { createMarkAllAsReadController } from "@/http/controllers/notifications/markAllAsReadController.js";

const router = Router();
const notificationService = getDependencies().getNotificationService();

const getNotificationsController = createGetNotificationsController(
  notificationService,
);
const getUnreadCountController = createGetUnreadCountController(
  notificationService,
);
const markAsReadController = createMarkAsReadController(notificationService);
const markAllAsReadController = createMarkAllAsReadController(
  notificationService,
);

// Get user's notifications (with pagination)
router.get("/", requireAuth, getNotificationsController);

// Get unread notification count
router.get("/unread-count", requireAuth, getUnreadCountController);

// Mark specific notification as read
router.patch("/:id/read", requireAuth, markAsReadController);

// Mark all notifications as read
router.patch("/read-all", requireAuth, markAllAsReadController);

export default router;
