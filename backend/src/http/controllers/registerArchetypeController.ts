import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { RegisterArchetypeDTO } from "@/application/ports/ArchetypeService";
import { AuthenticatedRequest } from "@/http/middlewares/authMiddleware";

export const registerArchetypeController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    if (typeof id !== 'string') {
      res.status(400).json({ success: false, error: "Invalid archetype ID" });
      return;
    }
    const archetypeId = parseInt(id);
    const { cardPairs, headerCardId } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id;

    const registerData: RegisterArchetypeDTO = {
      archetypeId,
      cardPairs,
      headerCardId,
      userId,
    };

    const archetypeService = getDependencies().getArchetypeService();
    const updatedArchetype =
      await archetypeService.registerArchetypeWithPairs(registerData);

    res.status(200).json({
      success: true,
      archetype: updatedArchetype,
      message: "Archetype registered successfully",
    });
  } catch (error) {
    console.error("Error registering archetype:", error);

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
