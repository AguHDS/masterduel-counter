import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

export const confirmCardsController = async (req: Request, res: Response) => {
  try {
    const { cardIds } = req.body;
    
    const cardService = getDependencies().getCardService();
    await cardService.confirmSelectedCards(cardIds);
    
    res.json({ 
      success: true, 
      message: "Cards saved successfully" 
    });
  } catch (error) {
    console.error("Error confirming cards:", error);
    res.status(500).json({ 
      error: "Failed to confirm cards",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
