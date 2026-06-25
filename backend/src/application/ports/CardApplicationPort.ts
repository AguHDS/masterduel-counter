import { CardSearchResult, CardPreviewDTO } from "@/domain/Card.js";

export interface CardApplicationPort {
  /**
   * Searches cards in the YGOProDeck API by name.
   * Returns only metadata (id and name), without image URLs.
   * @param query - Search term (partial or full card name)
   * @returns Array of results with id and name of the found cards
   */
  searchCards(query: string, limit?: number): Promise<CardSearchResult[]>;

  /**
   * Retrieves or creates a card with its YGOProdeck image URLs.
   * If the card exists in the DB, returns its cached URLs.
   * If it does not exist, fetches URLs from YGOProDeck API and saves them in the DB.
   * @param cardId - Unique card ID in YGOProDeck
   * @returns Card data including YGOProdeck image URLs
   * @throws Error if the card does not exist in YGOProDeck or has no images
   */
  selectCard(cardId: number): Promise<CardPreviewDTO>;

  /**
   * Ensures all selected cards exist in DB (fetches missing ones from YGOProdeck API).
   * Cards are reused if they already exist (INSERT OR REPLACE with PRIMARY KEY).
   * This creates a permanent cache of card URLs for better performance.
   * @param cardIds - Array of card IDs to ensure exist in DB
   */
  confirmSelectedCards(cardIds: number[]): Promise<void>;
}
