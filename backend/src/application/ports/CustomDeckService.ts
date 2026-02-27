import {
  CustomDeck,
  CustomDeckCreateDTO,
  CustomDeckUpdateDTO,
  CustomDeckWithCards,
} from "@/domain/CustomDeck";

/** Custom deck por for user profiles */
export interface CustomDeckServicePort {
  /** Creates a new custom deck */
  createDeck(data: CustomDeckCreateDTO): Promise<CustomDeck>;
  /** Retrieves all custom decks for a specific user */
  getDecksByUserId(userId: string): Promise<CustomDeckWithCards[]>;
  /** Retrieves a specific custom deck by its ID */
  getDeckById(deckId: number, userId: string): Promise<CustomDeckWithCards | null>;
  /** Updates a specific custom deck */
  updateDeck(deckId: number, userId: string, data: CustomDeckUpdateDTO): Promise<CustomDeck>;
  /** Deletes a specific custom deck */
  deleteDeck(deckId: number, userId: string): Promise<void>;
  /** Checks if a user can create a new custom deck */
  canUserCreateDeck(userId: string, userRole: string): Promise<boolean>;
}
