import {
  RecommendedDeck,
  RecommendedDeckCreateDTO,
  RecommendedDeckUpdateDTO,
  RecommendedDeckWithCards,
} from "@/domain/RecommendedDeck.js";
import { RecommendedDeckApplicationPort } from "../ports/RecommendedDeckApplicationPort.js";
import { RecommendedDeckRepository } from "@/domain/ports/RecommendedDeckRepository.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";

type CardInfo = {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
  frameType: string | undefined;
  level: number | undefined;
};

export class RecommendedDeckApplicationService implements RecommendedDeckApplicationPort {
  constructor(
    private deckRepository: RecommendedDeckRepository,
    private cardRepository: CardRepository,
  ) {}

  async createDeck(data: RecommendedDeckCreateDTO): Promise<RecommendedDeck> {
    // Permitir crear deck vacío (el usuario puede agregar cartas después)
    // Validate max cards
    if (data.mainDeckCards.length > 60) {
      throw new Error("Main deck cannot have more than 60 cards");
    }
    if (data.extraDeckCards.length > 15) {
      throw new Error("Extra deck cannot have more than 15 cards");
    }
    if (data.sideDeckCards && data.sideDeckCards.length > 0) {
      if (data.sideDeckCards.length > 20) {
        throw new Error("Side deck cannot have more than 20 cards");
      }
      if (data.sideDeckCards.length < 1) {
        throw new Error("Side deck must have at least 1 card if present");
      }
    }

    return this.deckRepository.createDeck(data);
  }

  async getDeckByInstanceId(
    instanceId: number,
  ): Promise<RecommendedDeckWithCards | null> {
    const deck = await this.deckRepository.getDeckByInstanceId(instanceId);
    if (!deck) return null;

    // Fetch card details for main deck (filter out missing cards)
    const mainDeckPromises = deck.mainDeckCards.map(async (cardId: number) => {
      const card = await this.cardRepository.finCardById(cardId);
      if (!card) {
        console.warn(`Card not found: ${cardId}, skipping...`);
        return null;
      }
      return {
        id: card.id,
        name: card.name,
        imageUrl: card.imageUrl,
        imageUrlSmall: card.imageUrlSmall,
        imageUrlCropped: card.imageUrlCropped,
        frameType: card.frameType,
        level: card.level,
      };
    });

    // Fetch card details for extra deck (filter out missing cards)
    const extraDeckPromises = deck.extraDeckCards.map(
      async (cardId: number) => {
        const card = await this.cardRepository.finCardById(cardId);
        if (!card) {
          console.warn(`Card not found: ${cardId}, skipping...`);
          return null;
        }
        return {
          id: card.id,
          name: card.name,
          imageUrl: card.imageUrl,
          imageUrlSmall: card.imageUrlSmall,
          imageUrlCropped: card.imageUrlCropped,
          frameType: card.frameType,
          level: card.level,
        };
      },
    );

    // Fetch card details for side deck (filter out missing cards)
    const sideDeckPromises = deck.sideDeckCards.map(
      async (cardId: number) => {
        const card = await this.cardRepository.finCardById(cardId);
        if (!card) {
          console.warn(`Card not found: ${cardId}, skipping...`);
          return null;
        }
        return {
          id: card.id,
          name: card.name,
          imageUrl: card.imageUrl,
          imageUrlSmall: card.imageUrlSmall,
          imageUrlCropped: card.imageUrlCropped,
          frameType: card.frameType,
          level: card.level,
        };
      },
    );

    const [mainDeckResults, extraDeckResults, sideDeckResults] = await Promise.all([
      Promise.all(mainDeckPromises),
      Promise.all(extraDeckPromises),
      Promise.all(sideDeckPromises),
    ]);

    // Filter out null values (missing cards) with type guard
    const mainDeck = mainDeckResults.filter(
      (card): card is CardInfo => card !== null,
    );
    const extraDeck = extraDeckResults.filter(
      (card): card is CardInfo => card !== null,
    );
    const sideDeck = sideDeckResults.filter(
      (card): card is CardInfo => card !== null,
    );

    return {
      id: deck.id,
      instanceId: deck.instanceId,
      title: deck.title,
      mainDeck,
      extraDeck,
      sideDeck,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }

  async updateDeck(
    instanceId: number,
    data: RecommendedDeckUpdateDTO,
  ): Promise<RecommendedDeck> {
    // Validate max cards if provided
    if (data.mainDeckCards && data.mainDeckCards.length > 60) {
      throw new Error("Main deck cannot have more than 60 cards");
    }
    if (data.extraDeckCards && data.extraDeckCards.length > 15) {
      throw new Error("Extra deck cannot have more than 15 cards");
    }
    if (data.sideDeckCards !== undefined && data.sideDeckCards.length > 0) {
      if (data.sideDeckCards.length > 20) {
        throw new Error("Side deck cannot have more than 20 cards");
      }
      if (data.sideDeckCards.length < 1) {
        throw new Error("Side deck must have at least 1 card if present");
      }
    }

    return this.deckRepository.updateDeck(instanceId, data);
  }

  async deleteDeck(instanceId: number): Promise<void> {
    return this.deckRepository.deleteDeck(instanceId);
  }
}
