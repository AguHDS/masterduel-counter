import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

/** Search for letters by name in the local db and/or external Api */
export const searchCardsController = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    const cardService = getDependencies().getCardService();
    const results = await cardService.searchCards(query as string);
    
    res.json({ results });
  } catch (error) {
    // If it's a 400 error from the API, it's not a critical error (just no results)
    if (error instanceof Error && error.message.includes("400 Bad Request")) {
      return res.status(400).json({ 
        error: "Search failed",
        message: "Unable to search cards. Please try a different query."
      });
    }
    
    // If it's any other API error, return a more specific message
    if (error instanceof Error && error.message.includes("API request failed")) {
      return res.status(400).json({ 
        error: "Search failed",
        message: "Unable to search cards. Please try a different query."
      });
    }
    
    res.status(500).json({ 
      error: "Failed to search cards",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
