import { Request, Response } from "express";
import { ArchetypeInstanceRepository } from "../../domain/ports/ArchetypeInstanceRepository";
import { ArchetypeCardPairRepository } from "../../domain/ports/ArchetypeCardPairRepository";
import { CardRepository } from "../../domain/ports/CardRepository";
import { ArchetypeRepository } from "../../domain/ports/ArchetypeRepository";
import { UserRepository } from "../../domain/ports/UserRepository";

/** Gets the full instance of a user for an archetype (card pairs, header, comments, effectiveness) */
export const createGetUserInstanceController = (
  instanceRepository: ArchetypeInstanceRepository,
  cardPairRepository: ArchetypeCardPairRepository,
  cardRepository: CardRepository,
  archetypeRepository: ArchetypeRepository,
  userRepository: UserRepository
) => {
  return async (req: Request, res: Response) => {
    try {
      const archetypeIdParam = req.params.archetypeId;
      const userIdParam = req.params.userId;

      if (typeof archetypeIdParam !== 'string' || typeof userIdParam !== 'string') {
        return res.status(400).json({ 
          error: "Invalid parameters" 
        });
      }

      const archetypeId = parseInt(archetypeIdParam);
      const userId = userIdParam;

      if (isNaN(archetypeId)) {
        return res.status(400).json({ 
          error: "Invalid archetype ID" 
        });
      }

      // Search the instance of the user for this archetype
      const instance = await instanceRepository.findArchetypeInstanceByArchetypeAndUserId(
        archetypeId, 
        userId
      );

      if (!instance) {
        return res.status(404).json({ 
          error: "Instance not found for this user and archetype" 
        });
      }

      // Get the card pairs with details
      const cardPairs = await cardPairRepository.findByInstanceIdWithDetails(
        instance.id
      );

      // Get the header card if it exists
      let headerCard = null;
      if (instance.headerCardId) {
        const card = await cardRepository.findById(instance.headerCardId);
        if (card) {
          headerCard = {
            id: card.id,
            name: card.name,
            imageUrl: card.imageUrl,
            imageUrlSmall: card.imageUrlSmall,
          };
        }
      }

      // Get archetype information
      const archetype = await archetypeRepository.findArchetypeById(archetypeId);
      const archetypeName = archetype?.name || "Unknown";

      // Get user information
      const user = await userRepository.findById(userId);
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
      console.error("Error fetching user instance:", error);
      return res.status(500).json({ 
        error: "Failed to fetch user instance" 
      });
    }
  };
};

