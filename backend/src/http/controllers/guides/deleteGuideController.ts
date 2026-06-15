import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const deleteGuideController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = req.validatedDeleteGuideData;

    if (!validatedData) {
      res
        .status(400)
        .json({ success: false, error: "Validation data not found" });
      return;
    }

    const { instanceId, userId, userRole } = validatedData;

    // Get guide data before deleting (to get archetypeId)
    const instanceService = getDependencies().getInstanceService();
    const instance = await instanceService.getGuideById(instanceId);

    if (!instance) {
      res.status(404).json({ success: false, error: "Guide not found" });
      return;
    }

    const archetypeId = instance.archetypeId;

    // Delete the guide (ownership verified in service, admins bypass)
    await instanceService.deleteGuide(instanceId, userId, userRole);

    // Check if there are any remaining instances for this archetype
    const remainingInstances =
      await instanceService.getGuidesByArchetypeId(archetypeId);

    // If no instances left, mark archetype as not registered
    if (remainingInstances.length === 0) {
      const archetypeRepository = getDependencies().getArchetypeRepository();
      await archetypeRepository.updateExistingArchetype(archetypeId, {
        registered: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Guide deleted successfully",
    });
  } catch (error) {
    console.error("[DeleteGuideController] Error deleting guide:", error);

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
