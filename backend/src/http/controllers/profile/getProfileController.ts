import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const profileService = getDependencies().getProfileService();
    const instanceService = getDependencies().getInstanceService();
    const prisma = getDependencies().getPrismaClient();
    
    const [profile, totalViews] = await Promise.all([
      profileService.getProfile(userId),
      instanceService.getTotalViewsByUserId(userId),
    ]);

    // Calculate user's rank based on total likes
    // Get all users with their total likes and registration date
    const usersWithLikes = await prisma.user.findMany({
      select: {
        id: true,
        createdAt: true,
        archetypeInstances: {
          select: {
            likes: true,
          },
        },
      },
    });

    // Calculate total likes for each user and sort
    // Include all users (even with 0 likes) and sort by likes DESC, then createdAt ASC
    const rankedUsers = usersWithLikes
      .map((user) => ({
        userId: user.id,
        totalLikes: user.archetypeInstances.reduce(
          (sum, instance) => sum + instance.likes,
          0,
        ),
        createdAt: user.createdAt,
      }))
      .sort((a, b) => {
        // Sort by total likes descending
        if (b.totalLikes !== a.totalLikes) {
          return b.totalLikes - a.totalLikes;
        }
        // If likes are equal, sort by registration date ascending (earlier = better rank)
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    // Find the rank of the current user (will always have a rank now)
    const rank = rankedUsers.findIndex((u) => u.userId === userId) + 1;

    return res.json({
      success: true,
      profile,
      totalViews,
      rank,
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get profile",
    });
  }
};
