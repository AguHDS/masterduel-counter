import {
  CustomDeck,
  CustomDeckCreateDTO,
  CustomDeckUpdateDTO,
  CustomDeckWithCards,
  CustomDeckReorderDTO,
} from "@/domain/CustomDeck.js";
import { CustomDeckApplicationPort } from "../ports/CustomDeckApplicationPort.js";
import { CustomDeckRepository } from "@/domain/ports/CustomDeckRepository.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";

const MAX_DECKS_USER = 10;
const MAX_DECKS_SUPPORTER = 30;

/** Used for personal decks in user profile */
export class CustomDeckApplicationService implements CustomDeckApplicationPort {
  constructor(
    private deckRepository: CustomDeckRepository,
    private cardRepository: CardRepository
  ) {}

  async createDeck(data: CustomDeckCreateDTO): Promise<CustomDeck> {
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

  async getDecksByUserId(userId: string): Promise<CustomDeckWithCards[]> {
    const decks = await this.deckRepository.getDecksByUserId(userId);

    // Map each deck to include card details
    const decksWithCards = await Promise.all(
      decks.map(async (deck) => {
        return this.mapDeckWithCards(deck);
      })
    );

    return decksWithCards;
  }

  async getDeckById(deckId: number, userId: string): Promise<CustomDeckWithCards | null> {
    const deck = await this.deckRepository.getDeckById(deckId, userId);
    if (!deck) return null;

    return this.mapDeckWithCards(deck);
  }

  async updateDeck(
    deckId: number,
    userId: string,
    data: CustomDeckUpdateDTO
  ): Promise<CustomDeck> {
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

    return this.deckRepository.updateDeck(deckId, userId, data);
  }

  async deleteDeck(deckId: number, userId: string): Promise<void> {
    return this.deckRepository.deleteDeck(deckId, userId);
  }

  async canUserCreateDeck(userId: string, userRole: string): Promise<boolean> {
    const deckCount = await this.deckRepository.countDecksByUserId(userId);
    
    // Check limit based on role
    if (userRole === "supporter" && deckCount >= MAX_DECKS_SUPPORTER) {
      return false;
    }
    
    if (userRole === "user" && deckCount >= MAX_DECKS_USER) {
      return false;
    }

    return true;
  }

  private async mapDeckWithCards(deck: CustomDeck): Promise<CustomDeckWithCards> {
    // Fetch card details for main deck (filter out missing cards)
    const mainDeckPromises = deck.mainDeckCards.map(async (cardId) => {
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
      };
    });

    // Fetch card details for extra deck (filter out missing cards)
    const extraDeckPromises = deck.extraDeckCards.map(async (cardId) => {
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
      };
    });

    // Fetch card details for side deck (filter out missing cards)
    const sideDeckPromises = deck.sideDeckCards.map(async (cardId) => {
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
      };
    });

    // Fetch header card if headerCardId exists
    let headerCardPromise: Promise<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
      imageUrlCropped: string;
    } | null> = Promise.resolve(null);

    if (deck.headerCardId) {
      headerCardPromise = (async () => {
        const card = await this.cardRepository.finCardById(deck.headerCardId!);
        if (!card) {
          console.warn(`Header card not found: ${deck.headerCardId}, skipping...`);
          return null;
        }
        return {
          id: card.id,
          name: card.name,
          imageUrl: card.imageUrl,
          imageUrlSmall: card.imageUrlSmall,
          imageUrlCropped: card.imageUrlCropped,
        };
      })();
    }

    const [mainDeckResults, extraDeckResults, sideDeckResults, headerCardResult] = await Promise.all([
      Promise.all(mainDeckPromises),
      Promise.all(extraDeckPromises),
      Promise.all(sideDeckPromises),
      headerCardPromise,
    ]);

    // Filter out null values (missing cards)
    const mainDeck = mainDeckResults.filter((card) => card !== null);
    const extraDeck = extraDeckResults.filter((card) => card !== null);
    const sideDeck = sideDeckResults.filter((card) => card !== null);

    return {
      id: deck.id,
      userId: deck.userId,
      title: deck.title,
      isPublic: deck.isPublic,
      headerCardId: deck.headerCardId,
      displayOrder: deck.displayOrder,
      headerCard: headerCardResult || undefined,
      mainDeck,
      extraDeck,
      sideDeck,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }

  async reorderDecks(userId: string, data: CustomDeckReorderDTO): Promise<void> {
    // Validate that all deckIds belong to the user
    const userDecks = await this.deckRepository.getDecksByUserId(userId);
    const userDeckIds = new Set(userDecks.map(d => d.id));
    
    for (const order of data.deckOrders) {
      if (!userDeckIds.has(order.deckId)) {
        throw new Error(`Deck ${order.deckId} does not belong to user ${userId}`);
      }
    }

    // Reorder the decks
    await this.deckRepository.reorderDecks(userId, data.deckOrders);
  }
}
