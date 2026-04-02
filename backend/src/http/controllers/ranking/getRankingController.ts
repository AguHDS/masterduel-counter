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
        createdAt: true,
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

    // Calculate total likes for each user (include all users, even with 0 likes)
    const ranking = usersWithLikes
      .map((user) => {
        const totalLikes = user.archetypeInstances.reduce(
          (sum, instance) => sum + instance.likes,
          0,
        );

        return {
          userId: user.id,
          username: user.name,
          profilePictureUrl: user.profile?.profilePictureUrl,
          totalLikes,
          createdAt: user.createdAt,
        };
      })
      .sort((a, b) => {
        // Sort by total likes descending first
        if (b.totalLikes !== a.totalLikes) {
          return b.totalLikes - a.totalLikes;
        }
        // If likes are equal, sort by registration date ascending (earlier = better rank)
        return a.createdAt.getTime() - b.createdAt.getTime();
      })
      .map((user, index) => ({
        userId: user.userId,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl,
        totalLikes: user.totalLikes,
        rank: index + 1, // Assign rank based on position in sorted array
      }));

    // Get total count
    const total = ranking.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedRanking = ranking.slice(skip, skip + limit);

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
      message: error instanceof Error ? error.message : "Failed to get ranking",
    });
  }
};
