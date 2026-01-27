import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

export const searchCardsController = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    const cardService = getDependencies().getCardService();
    const results = await cardService.searchCards(query as string);
    
    res.json({ results });
  } catch (error) {
    console.error("Error searching cards:", error);
    res.status(500).json({ 
      error: "Failed to search cards",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
