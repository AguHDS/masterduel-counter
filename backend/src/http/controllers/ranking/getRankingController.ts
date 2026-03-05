import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getRankingController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const prisma = getDependencies().getPrismaClient();

    // Get all users with their profiles and calculate total likes
    const skip = (page - 1) * limit;

    // Get users with their instances and aggregate likes
    const usersWithLikes = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            profilePictureUrl: true,
          },
        },
        archetypeInstances: {
          select: {
            likes: true,
          },
        },
      },
    });

    // Calculate total likes for each user and filter out users with 0 likes
    const ranking = usersWithLikes
      .map((user) => {
        const totalLikes = user.archetypeInstances.reduce(
          (sum, instance) => sum + instance.likes,
          0,
        );

        return {
          userId: user.id,
          username: user.name,
          profilePictureUrl:
            user.profile?.profilePictureUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          totalLikes,
        };
      })
      .filter((user) => user.totalLikes > 0) // Only include users with at least 1 like
      .sort((a, b) => b.totalLikes - a.totalLikes); // Sort by total likes descending

    // Get total count
    const total = ranking.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedRanking = ranking.slice(skip, skip + limit).map((user, index) => ({
      ...user,
      rank: skip + index + 1,
    }));

    return res.json({
      success: true,
      ranking: paginatedRanking,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error getting ranking:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get ranking",
    });
  }
};
