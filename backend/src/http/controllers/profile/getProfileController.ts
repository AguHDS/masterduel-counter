import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

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
    // Get all users with their total likes
    const usersWithLikes = await prisma.user.findMany({
      select: {
        id: true,
        archetypeInstances: {
          select: {
            likes: true,
          },
        },
      },
    });

    // Calculate total likes for each user and sort
    const rankedUsers = usersWithLikes
      .map((user) => ({
        userId: user.id,
        totalLikes: user.archetypeInstances.reduce(
          (sum, instance) => sum + instance.likes,
          0,
        ),
      }))
      .filter((user) => user.totalLikes > 0)
      .sort((a, b) => b.totalLikes - a.totalLikes);

    // Find the rank of the current user
    const userRank = rankedUsers.findIndex((u) => u.userId === userId) + 1;
    const rank = userRank > 0 ? userRank : null;

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
