import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { validateStringParam, validateNumberParam } from "@/shared/utils/paramValidation";

export const updateFavoriteCardAndDecksController = async (req: Request, res: Response) => {
  try {
    // Validar userId de req.params
    const userId = validateStringParam(req.params.userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing user ID",
      });
    }

    const favoriteCardId = validateNumberParam(req.body.favoriteCardId);
    
    const { favoriteDecks } = req.body;
    
    const profileService = getDependencies().getProfileService();
    
    const profile = await profileService.updateFavoriteCardAndDecks(
      userId,
      favoriteCardId,
      favoriteDecks ?? null
    );

    return res.status(200).json({
      success: true,
      profile,
      message: "Favorites updated successfully",
    });
  } catch (error) {
    console.error("Error updating favorites:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update favorites",
    });
  }
};