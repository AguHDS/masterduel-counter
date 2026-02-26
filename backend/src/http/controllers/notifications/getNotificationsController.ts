import { Request, Response } from "express";
import { NotificationServicePort } from "@/application/ports/NotificationService";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware";

/** Get user's notifications with pagination */
export const createGetNotificationsController =
  (notificationService: NotificationServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationService.getUserNotifications(
        userId,
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error getting notifications:", error);
      res.status(500).json({
        error: "Failed to get notifications",
      });
    }
  };
