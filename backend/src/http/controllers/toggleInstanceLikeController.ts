import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/http/middlewares/authMiddleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Toggles a like on an archetype instance (add if not exists, remove if exists).
 * Users cannot like their own instances.
 * 
 * @route POST /api/archetypes/:archetypeId/instances/:instanceId/like
 * @param archetypeId - ID of the archetype
 * @param instanceId - ID of the instance to like/unlike
 * @returns Updated like status and count
 */
export const toggleInstanceLikeController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { instanceId } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (typeof instanceId !== 'string') {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceIdNum = parseInt(instanceId, 10);
    if (isNaN(instanceIdNum)) {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    // Get the instance to check ownership
    const instance = await prisma.archetypeInstance.findUnique({
      where: { id: instanceIdNum },
    });

    if (!instance) {
      res.status(404).json({ success: false, error: "Instance not found" });
      return;
    }

    // Prevent users from liking their own instances
    if (instance.userId === userId) {
      res.status(403).json({ 
        success: false, 
        error: "You cannot like your own instance" 
      });
      return;
    }

    // Check if like already exists
    const existingLike = await prisma.instanceLike.findUnique({
      where: {
        instanceId_userId: {
          instanceId: instanceIdNum,
          userId,
        },
      },
    });

    let liked: boolean;
    let newLikeCount: number;

    if (existingLike) {
      // Remove like
      await prisma.instanceLike.delete({
        where: { id: existingLike.id },
      });

      // Decrement like count
      const updated = await prisma.archetypeInstance.update({
        where: { id: instanceIdNum },
        data: { likes: { decrement: 1 } },
      });

      liked = false;
      newLikeCount = updated.likes;
    } else {
      // Add like
      await prisma.instanceLike.create({
        data: {
          instanceId: instanceIdNum,
          userId,
        },
      });

      // Increment like count
      const updated = await prisma.archetypeInstance.update({
        where: { id: instanceIdNum },
        data: { likes: { increment: 1 } },
      });

      liked = true;
      newLikeCount = updated.likes;
    }

    res.status(200).json({
      success: true,
      liked,
      likes: newLikeCount,
    });
  } catch (error) {
    console.error("Error toggling instance like:", error);

    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
};
