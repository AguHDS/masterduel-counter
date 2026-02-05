import { Request, Response } from "express";
import { ArchetypeInstanceRepository } from "../../domain/ports/ArchetypeInstanceRepository";
import { ArchetypeCardPairRepository } from "../../domain/ports/ArchetypeCardPairRepository";
import { CardRepository } from "../../domain/ports/CardRepository";
import { ArchetypeRepository } from "../../domain/ports/ArchetypeRepository";
import { UserRepository } from "../../domain/ports/UserRepository";

/** Gets the full instance by its ID (card pairs, header, comments, effectiveness) */
export const createGetInstanceByIdController = (
  instanceRepository: ArchetypeInstanceRepository,
  cardPairRepository: ArchetypeCardPairRepository,
  cardRepository: CardRepository,
  archetypeRepository: ArchetypeRepository,
  userRepository: UserRepository
) => {
  return async (req: Request, res: Response) => {
    try {
      const instanceIdParam = req.params.instanceId;

      if (typeof instanceIdParam !== 'string') {
        return res.status(400).json({ 
          error: "Invalid parameters" 
        });
      }

      const instanceId = parseInt(instanceIdParam);

      if (isNaN(instanceId)) {
        return res.status(400).json({ 
          error: "Invalid instance ID" 
        });
      }

      // Search instance by ID
      const instance = await instanceRepository.findArchetypeInstanceById(instanceId);

      if (!instance) {
        return res.status(404).json({ 
          error: "Instance not found" 
        });
      }

      // Get card pairs with details
      const cardPairs = await cardPairRepository.findByInstanceIdWithDetails(
        instance.id
      );

      // Get the header card if exists
      let headerCard = null;
      if (instance.headerCardId) {
        const card = await cardRepository.findById(instance.headerCardId);
        if (card) {
          headerCard = {
            id: card.id,
            name: card.name,
            imageUrl: card.imageUrl,
            imageUrlSmall: card.imageUrlSmall,
            imageUrlCropped: card.imageUrlCropped,
          };
        }
      }

      const archetype = await archetypeRepository.findById(instance.archetypeId);
      const archetypeName = archetype?.name || "Unknown";

      const user = await userRepository.findById(instance.userId);
      const userName = user?.username || "Unknown";

      return res.json({
        instance: {
          id: instance.id,
          archetypeId: instance.archetypeId,
          userId: instance.userId,
          title: instance.title,
          headerCardId: instance.headerCardId,
          generalTip: instance.generalTip,
          likes: instance.likes,
          createdAt: instance.createdAt,
          updatedAt: instance.updatedAt,
        },
        userName,
        archetypeName,
        headerCard,
        cardPairs: cardPairs.map(pair => ({
          id: pair.id,
          topCards: pair.top_cards.map(card => ({
            id: card.id,
            name: card.name,
            imageUrl: card.image_url,
            imageUrlSmall: card.image_url_small,
            imageUrlCropped: card.image_url_cropped,
          })),
          bottomCards: pair.bottom_cards.map(card => ({
            id: card.id,
            name: card.name,
            imageUrl: card.image_url,
            imageUrlSmall: card.image_url_small,
            imageUrlCropped: card.image_url_cropped,
          })),
          effectiveness: pair.effectiveness,
          comment: pair.comment,
        })),
      });
    } catch (error) {
      console.error("Error fetching instance by ID:", error);
      return res.status(500).json({ 
        error: "Failed to fetch instance" 
      });
    }
  };
};
