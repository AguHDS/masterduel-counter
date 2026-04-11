import {
  CustomDeck,
  CustomDeckCreateDTO,
  CustomDeckUpdateDTO,
} from "../CustomDeck.js";

/** Used for managing custom decks in user profiles */
export interface CustomDeckRepository {
  /** Creates a new custom deck */
  createDeck(data: CustomDeckCreateDTO): Promise<CustomDeck>;
  /** Retrieves all custom decks for a specific user */
  getDecksByUserId(userId: string): Promise<CustomDeck[]>;
  /** Retrieves a specific custom deck by its ID */
  getDeckById(deckId: number, userId: string): Promise<CustomDeck | null>;
  /** Updates a specific custom deck */
  updateDeck(deckId: number, userId: string, data: CustomDeckUpdateDTO): Promise<CustomDeck>;
  /** Deletes a specific custom deck */
  deleteDeck(deckId: number, userId: string): Promise<void>;
  /** Counts the number of custom decks for a specific user */
  countDecksByUserId(userId: string): Promise<number>;
  /** Reorders multiple custom decks */
  reorderDecks(userId: string, deckOrders: { deckId: number; displayOrder: number }[]): Promise<void>;
}
