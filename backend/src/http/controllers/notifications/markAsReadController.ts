import { Request, Response } from "express";
import { NotificationServicePort } from "@/application/ports/NotificationService.js";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";
import { extractNumberParam } from "@/shared/utils/paramValidation.js";

/** Mark a single notification as read */
export const createMarkAsReadController =
  (notificationService: NotificationServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const notificationId = extractNumberParam(req.params.id, "Notification ID");

      const notification = await notificationService.markAsRead(
        notificationId,
        userId,
      );

      res.status(200).json({
        success: true,
        notification,
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error marking notification as read:", err);
      
      if (err.message === "Notification not found") {
        res.status(404).json({ error: err.message });
        return;
      }
      
      if (err.message === "You can only mark your own notifications as read") {
        res.status(403).json({ error: err.message });
        return;
      }

      res.status(500).json({
        error: "Failed to mark notification as read",
      });
    }
  };
