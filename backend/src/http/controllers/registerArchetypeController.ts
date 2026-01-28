import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { AuthenticatedRequest } from "@/http/middlewares/authMiddleware";

/** Registra o actualiza una instancia de arquetipo con sus pares de cartas y header card */
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

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Validate that at least one card pair is provided
    if (!cardPairs || cardPairs.length === 0) {
      res.status(400).json({ 
        success: false, 
        error: "At least one card pair is required to register an archetype" 
      });
      return;
    }

    // Validate that header card is provided
    if (!headerCardId) {
      res.status(400).json({ 
        success: false, 
        error: "Header card is required to register an archetype" 
      });
      return;
    }

    // Crear o actualizar la instancia
    const instanceService = getDependencies().getInstanceService();
    const instance = await instanceService.createOrUpdateInstance({
      archetypeId,
      userId,
      headerCardId: headerCardId || null,
    });

    // Confirmar cartas y guardar pares
    if (cardPairs && cardPairs.length > 0) {
      const cardService = getDependencies().getCardService();
      const cardPairRepository = getDependencies().getCardPairRepository();

      // Extraer IDs de cartas únicas
      const cardIds = Array.from(
        new Set([
          ...cardPairs.flatMap((pair: { topCardIds: number[]; bottomCardIds: number[] }) => [...pair.topCardIds, ...pair.bottomCardIds]),
          ...(headerCardId ? [headerCardId] : []),
        ]),
      );

      // Confirmar cartas
      await cardService.confirmSelectedCards(cardIds);

      // Eliminar pares existentes de esta instancia
      await cardPairRepository.deleteByInstanceId(instance.id);

      // Crear nuevos pares
      const pairsToCreate = cardPairs.map((pair: { topCardIds: number[]; bottomCardIds: number[]; effectiveness?: string; comment?: string }, index: number) => ({
        instance_id: instance.id,
        top_card_ids: pair.topCardIds,
        bottom_card_ids: pair.bottomCardIds,
        pair_order: index + 1,
        effectiveness: pair.effectiveness || null,
        comment: pair.comment || null,
      }));

      await cardPairRepository.createMany(pairsToCreate);
    }

    // Marcar arquetipo como registrado si no lo está ya
    const archetypeService = getDependencies().getArchetypeService();
    const archetype = await archetypeService.getArchetypeById(archetypeId);
    
    if (archetype && !archetype.registered) {
      await getDependencies().getArchetypeRepository().update(archetypeId, {
        registered: true,
      });
    }

    res.status(200).json({
      success: true,
      instance,
      message: "Archetype instance registered successfully",
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
