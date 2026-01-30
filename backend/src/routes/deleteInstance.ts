import { Router } from "express";
import { Request, Response } from "express";
import { getDependencies } from "../compositionRoot";
import { requireAuth, AuthenticatedRequest } from "../http/middlewares/authMiddleware";

const router = Router();

/** Delete an instance by its ID */
router.delete("/instances/:instanceId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const instanceIdParam = req.params.instanceId;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (typeof instanceIdParam !== 'string') {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceId = parseInt(instanceIdParam);

    if (isNaN(instanceId)) {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    // Get instance data before deleting (to get archetypeId)
    const instanceService = getDependencies().getInstanceService();
    const instance = await instanceService.getInstanceById(instanceId);
    
    if (!instance) {
      res.status(404).json({ success: false, error: "Instance not found" });
      return;
    }

    const archetypeId = instance.archetypeId;

    // Delete the instance (with ownership verification in service)
    await instanceService.deleteInstance(instanceId, userId);

    // Check if there are any remaining instances for this archetype
    const remainingInstances = await instanceService.getInstancesByArchetypeId(archetypeId);
    
    // If no instances left, mark archetype as not registered
    if (remainingInstances.length === 0) {
      const archetypeRepository = getDependencies().getArchetypeRepository();
      await archetypeRepository.update(archetypeId, { registered: false });
    }

    res.status(200).json({
      success: true,
      message: "Instance deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting instance:", error);

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
});

export default router;
