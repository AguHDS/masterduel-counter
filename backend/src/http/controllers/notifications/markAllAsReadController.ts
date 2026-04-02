import { Request, Response } from "express";
import { NotificationApplicationPort } from "@/application/ports/NotificationApplicationPort.js";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";

/** Mark all notifications as read for the current user */
export const createMarkAllAsReadController =
  (notificationService: NotificationApplicationPort) =>
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({
        error: "Failed to mark all notifications as read",
      });
    }
  };
