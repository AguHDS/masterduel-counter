import { Request, Response } from "express";
import { ProfileApplicationPort } from "@/application/ports/ProfileApplicationPort.js";
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";

/** Get all archetype guides created by a specific user (for user profile)*/
export const createGetUserGuidesController =
  (profileService: ProfileApplicationPort) =>
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const sortBy = req.query.sortBy as 'likes' | 'updated' | undefined;

      if (typeof userId !== 'string') {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      if (sortBy && sortBy !== 'likes' && sortBy !== 'updated') {
        res.status(400).json({ error: "Invalid sortBy parameter. Must be 'likes' or 'updated'" });
        return;
      }

      // Check if the requesting user is the profile owner or an admin
      const requestingUser = (req as AuthenticatedRequest).user;
      const isOwner = requestingUser?.id === userId;
      const isAdmin = requestingUser?.role === "admin";

      let instances;
      if (isOwner || isAdmin) {
        // Owner and admins see guides including drafts
        instances = await profileService.getGuideListByUserIdWithDrafts(
          userId,
          sortBy || 'updated'
        );
      } else {
        // Other users only see published guides
        instances = await profileService.getGuideListByUserId(
          userId,
          sortBy || 'updated'
        );
      }

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching user instances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
