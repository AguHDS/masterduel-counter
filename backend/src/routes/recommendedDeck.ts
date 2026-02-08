import { Router } from "express";
import { Request, Response } from "express";
import { getDependencies } from "../compositionRoot";
import { requireAuth, AuthenticatedRequest } from "../http/middlewares/authMiddleware";

const router = Router();

/** Create or update recommended deck for an instance */
router.post("/instances/:instanceId/recommended-deck", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const instanceIdParam = req.params.instanceId;
    const userId = (req as AuthenticatedRequest).user?.id;
    const { title, mainDeckCards, extraDeckCards } = req.body;

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

    // Verify instance ownership
    const instanceService = getDependencies().getInstanceService();
    const instance = await instanceService.getInstanceById(instanceId);
    
    if (!instance) {
      res.status(404).json({ success: false, error: "Instance not found" });
      return;
    }

    if (instance.userId !== userId) {
      res.status(403).json({ success: false, error: "You can only edit your own instances" });
      return;
    }

    // Validate input
    if (!Array.isArray(mainDeckCards) || !Array.isArray(extraDeckCards)) {
      res.status(400).json({ success: false, error: "Invalid deck data" });
      return;
    }


    // If both arrays(Main and Extra deck) are empty, reject the request
    // User must use the DELETE endpoint to delete the deck
    const hasContent = mainDeckCards.length > 0 || extraDeckCards.length > 0;
    
    if (!hasContent) {
      res.status(400).json({ 
        success: false, 
        error: "Cannot save deck with no cards. Use the DELETE endpoint to remove the deck." 
      });
      return;
    }

    const deckService = getDependencies().getRecommendedDeckService();
    
    // Check if deck exists
    const existingDeck = await deckService.getDeckByInstanceId(instanceId);
    
    let deck;
    if (existingDeck) {
      // Update existing deck
      deck = await deckService.updateDeck(instanceId, { title, mainDeckCards, extraDeckCards });
    } else {
      // Create new deck
      deck = await deckService.createDeck({ instanceId, title, mainDeckCards, extraDeckCards });
    }
    res.status(200).json({ success: true, deck });
  } catch (error) {
    console.error("[RecommendedDeck] Error saving recommended deck:", error);
    
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
});

/** Get recommended deck for an instance */
router.get("/instances/:instanceId/recommended-deck", async (req: Request, res: Response): Promise<void> => {
  try {
    const instanceIdParam = req.params.instanceId;

    if (typeof instanceIdParam !== 'string') {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const instanceId = parseInt(instanceIdParam);
    if (isNaN(instanceId)) {
      res.status(400).json({ success: false, error: "Invalid instance ID" });
      return;
    }

    const deckService = getDependencies().getRecommendedDeckService();
    const deck = await deckService.getDeckByInstanceId(instanceId);

    if (!deck) {
      res.status(204).send();
      return;
    }

    res.status(200).json({ success: true, deck });
  } catch (error) {
    console.error("[RecommendedDeck] Error fetching recommended deck:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

/** Delete recommended deck */
router.delete("/instances/:instanceId/recommended-deck", requireAuth, async (req: Request, res: Response): Promise<void> => {
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

    // Verify instance ownership
    const instanceService = getDependencies().getInstanceService();
    const instance = await instanceService.getInstanceById(instanceId);
    
    if (!instance) {
      res.status(404).json({ success: false, error: "Instance not found" });
      return;
    }

    if (instance.userId !== userId) {
      res.status(403).json({ success: false, error: "You can only edit your own instances" });
      return;
    }

    const deckService = getDependencies().getRecommendedDeckService();
    await deckService.deleteDeck(instanceId);

    res.status(200).json({ success: true, message: "Recommended deck deleted successfully" });
  } catch (error) {
    console.error("Error deleting recommended deck:", error);
    
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
});

export default router;
