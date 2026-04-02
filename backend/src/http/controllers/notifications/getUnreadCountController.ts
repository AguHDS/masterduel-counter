import { Request, Response } from "express";
import { NotificationApplicationPort } from "@/application/ports/NotificationApplicationPort.js";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";

/** Get unread notification count */
export const createGetUnreadCountController =
  (notificationService: NotificationApplicationPort) =>
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        count,
      });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.status(500).json({
        error: "Failed to get unread count",
      });
    }
  };
