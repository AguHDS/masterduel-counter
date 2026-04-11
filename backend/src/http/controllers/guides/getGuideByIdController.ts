import { Request, Response } from "express";
import { GuideRepository } from "@/domain/ports/GuideRepository.js";
import { GuideCardPairRepository } from "@/domain/ports/GuideCardPairRepository.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository.js";
import { UserRepository } from "@/domain/ports/UserRepository.js";
import { InitialHandRepository } from "@/domain/ports/InitialHandRepository.js";
import { ComboStepRepository } from "@/domain/ports/ComboStepRepository.js";
import { getDependencies } from "@/compositionRoot.js";

/**
 * Get full guide created by an user by ID to view.
 * Includes archetype name, username, user profile picture, header card details, card pairs, and initial hands with details.
 */
export const createGetGuideByIdController = (
  instanceRepository: GuideRepository,
  cardPairRepository: GuideCardPairRepository,
  cardRepository: CardRepository,
  archetypeRepository: ArchetypeRepository,
  userRepository: UserRepository,
  initialHandRepository: InitialHandRepository,
  comboStepRepository: ComboStepRepository,
) => {
  return async (req: Request, res: Response) => {
    try {
      const instanceIdParam = req.params.instanceId;

      if (typeof instanceIdParam !== "string") {
        return res.status(400).json({
          error: "Invalid parameters",
        });
      }

      const instanceId = parseInt(instanceIdParam);

      if (isNaN(instanceId)) {
        return res.status(400).json({
          error: "Invalid instance ID",
        });
      }

      // Search Guide by ID
      const instance =
        await instanceRepository.findArchetypeInstanceById(instanceId);

      if (!instance) {
        return res.status(404).json({
          error: "Guide not found",
        });
      }

      // Get card pairs with details (for COUNTER guides)
      const cardPairs = await cardPairRepository.findCardPairsByGuideId(
        instance.id,
      );

      // Get initial hands with details (for DECK guides)
      let initialHands = null;
      if (instance.guideType === "DECK") {
        const hands = await initialHandRepository.findInitialHandsByInstanceId(
          instance.id,
        );
        
        // Get combo steps for each initial hand
        const handsWithComboSteps = await Promise.all(
          hands.map(async (hand) => {
            const comboSteps = await comboStepRepository.findComboStepsByInitialHandId(hand.id);
            
            return {
              ...hand,
              comboSteps: comboSteps.map((step) => ({
                id: step.id,
                stepOrder: step.stepOrder,
                description: step.description,
                parentCanceledStepId: step.parentCanceledStepId,
                mainCards: step.mainCards.map((card) => ({
                  id: card.id,
                  name: card.name,
                  imageUrl: card.image_url,
                  imageUrlSmall: card.image_url_small,
                  imageUrlCropped: card.image_url_cropped,
                  chain_number: card.chain_number,
                })),
                subCards: step.subCards.map((card) => ({
                  id: card.id,
                  name: card.name,
                  imageUrl: card.image_url,
                  imageUrlSmall: card.image_url_small,
                  imageUrlCropped: card.image_url_cropped,
                  chain_number: card.chain_number,
                })),
                leftSubCards: step.leftSubCards.map((card) => ({
                  id: card.id,
                  name: card.name,
                  imageUrl: card.image_url,
                  imageUrlSmall: card.image_url_small,
                  imageUrlCropped: card.image_url_cropped,
                  chain_number: card.chain_number,
                })),
              })),
            };
          })
        );
        
        initialHands = handsWithComboSteps;
      }

      // Get the header card if exists
      let headerCard = null;
      if (instance.headerCardId) {
        const card = await cardRepository.finCardById(instance.headerCardId);
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

      const archetype = await archetypeRepository.findArchetypeById(
        instance.archetypeId,
      );
      const archetypeName = archetype?.name || "Unknown";

      const user = await userRepository.findUserById(instance.userId);
      const userName = user?.username || "Unknown";

      // Get user profile picture
      const profileService = getDependencies().getProfileService();
      const userProfile = await profileService.getProfile(instance.userId);
      const userProfilePictureUrl = userProfile?.profilePictureUrl || null;

      return res.json({
        instance: {
          id: instance.id,
          archetypeId: instance.archetypeId,
          userId: instance.userId,
          title: instance.title,
          headerCardId: instance.headerCardId,
          generalTip: instance.generalTip,
          guideType: instance.guideType,
          likes: instance.likes,
          favorites: instance.favorites,
          views: instance.views,
          createdAt: instance.createdAt,
          updatedAt: instance.updatedAt,
        },
        userName,
        userProfilePictureUrl,
        archetypeName,
        headerCard,
        cardPairs: cardPairs.map((pair) => ({
          id: pair.id,
          topCards: pair.top_cards.map((card) => ({
            id: card.id,
            name: card.name,
            imageUrl: card.image_url,
            imageUrlSmall: card.image_url_small,
            imageUrlCropped: card.image_url_cropped,
          })),
          bottomCards: pair.bottom_cards.map((card) => ({
            id: card.id,
            name: card.name,
            imageUrl: card.image_url,
            imageUrlSmall: card.image_url_small,
            imageUrlCropped: card.image_url_cropped,
            effectiveness: card.effectiveness,
          })),
          comment: pair.comment,
        })),
        initialHands: initialHands ? initialHands.map((hand) => ({
          id: hand.id,
          cards: hand.cards.map((card) => ({
            id: card.id,
            name: card.name,
            imageUrl: card.imageUrl,
            imageUrlSmall: card.imageUrlSmall,
            imageUrlCropped: card.imageUrlCropped,
          })),
          description: hand.description,
          finalBoard: hand.finalBoard ? {
            fieldSpell: hand.finalBoard.fieldSpell,
            extraMonsters: hand.finalBoard.extraMonsters,
            monsters: hand.finalBoard.monsters,
            spellTraps: hand.finalBoard.spellTraps,
            hand: hand.finalBoard.hand,
            graveyard: hand.finalBoard.graveyard,
            banished: hand.finalBoard.banished,
            description: hand.finalBoard.description,
          } : undefined,
          position: hand.position,
          comboSteps: hand.comboSteps,
        })) : undefined,
      });
    } catch (error) {
      console.error("Error fetching instance by ID:", error);
      return res.status(500).json({
        error: "Failed to fetch instance",
      });
    }
  };
};
