import {
  CustomDeck,
  CustomDeckCreateDTO,
  CustomDeckUpdateDTO,
  CustomDeckWithCards,
} from "@/domain/CustomDeck";
import { CustomDeckServicePort } from "../ports/CustomDeckService";
import { CustomDeckRepository } from "@/domain/ports/CustomDeckRepository";
import { CardRepository } from "@/domain/ports/CardRepository";

const MAX_DECKS_USER = 10;
const MAX_DECKS_SUPPORTER = 30;

/** Used for custom decks in user profiles */
export class CustomDeckService implements CustomDeckServicePort {
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

    const [mainDeckResults, extraDeckResults] = await Promise.all([
      Promise.all(mainDeckPromises),
      Promise.all(extraDeckPromises),
    ]);

    // Filter out null values (missing cards)
    const mainDeck = mainDeckResults.filter((card) => card !== null);
    const extraDeck = extraDeckResults.filter((card) => card !== null);

    return {
      id: deck.id,
      userId: deck.userId,
      title: deck.title,
      isPublic: deck.isPublic,
      mainDeck,
      extraDeck,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }
}
