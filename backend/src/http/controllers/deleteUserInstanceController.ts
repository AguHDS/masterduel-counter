import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { AuthenticatedRequest } from "@/http/middlewares/authMiddleware";

/**
 * Delete a user's instance for a specific archetype.
 * Only the owner of the instance can delete it.
 *
 * @route DELETE /api/archetypes/:archetypeId/users/:userId/instance
 * @param archetypeId - Archetype ID
 * @param userId - ID of the user who owns the instance
 * @returns Delete confirmation
 */
export const deleteUserInstanceController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { archetypeId, userId } = req.params;
    const requestUserId = (req as AuthenticatedRequest).user?.id;

    if (!requestUserId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Verify that the user is trying to delete their own instance
    if (requestUserId !== userId) {
      res.status(403).json({
        success: false,
        error: "You can only delete your own instances",
      });
      return;
    }

    if (typeof archetypeId !== "string") {
      res.status(400).json({ success: false, error: "Invalid archetype ID" });
      return;
    }

    const archetypeIdNum = parseInt(archetypeId, 10);
    if (isNaN(archetypeIdNum)) {
      res.status(400).json({ success: false, error: "Invalid archetype ID" });
      return;
    }

    // Get the instance first to check if it exists
    const instanceRepository = getDependencies().getInstanceRepository();
    const instance = await instanceRepository.findByArchetypeAndUser(
      archetypeIdNum,
      userId,
    );

    if (!instance) {
      res.status(404).json({
        success: false,
        error: "Instance not found",
      });
      return;
    }

    // Delete card pairs associated with this instance
    const cardPairRepository = getDependencies().getCardPairRepository();
    await cardPairRepository.deleteByInstanceId(instance.id);

    // Delete the instance
    await instanceRepository.delete(instance.id);

    // Check if there are any remaining instances for this archetype
    const remainingInstances =
      await instanceRepository.findByArchetypeId(archetypeIdNum);

    // If no more instances exist, mark archetype as unregistered
    if (remainingInstances.length === 0) {
      const archetypeRepository = getDependencies().getArchetypeRepository();
      await archetypeRepository.update(archetypeIdNum, {
        registered: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Instance deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user instance:", error);

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
