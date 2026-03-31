import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/**
 * Search users by username (public endpoint)
 * Returns basic user information for profile discovery
 */
export const searchUsersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = req.query.q as string;
    const limitParam = req.query.limit as string;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (!query || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "Search query is required",
      });
      return;
    }

    // Limit results to prevent large queries
    const maxLimit = Math.min(limit, 15);

    const userRepository = getDependencies().getUserRepository();
    const profileService = getDependencies().getProfileService();

    // Search users by username
    const users = await userRepository.searchUsersByUsername(query, maxLimit);

    // Get profile pictures for users
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await profileService.getProfile(user.id);
        return {
          userId: user.id,
          username: user.username,
          profilePictureUrl: profile?.profilePictureUrl || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithProfiles,
      total: usersWithProfiles.length,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search users",
    });
  }
};
