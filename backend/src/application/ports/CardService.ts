import { CardSearchResult, CardPreviewDTO } from "@/domain/Card";

export interface CardService {
  /**
   * Searches cards in the YGOProDeck API by name.
   * Returns only metadata (id and name), without image URLs.
   * @param query - Search term (partial or full card name)
   * @returns Array of results with id and name of the found cards
   */
  searchCards(query: string): Promise<CardSearchResult[]>;

  /**
   * Retrieves or creates a card with its images in Cloudinary.
   * If the card exists in the DB (temporary or permanent), returns its URLs.
   * If it does not exist, downloads it from YGOProDeck, uploads it to Cloudinary as temporary, and saves it in the DB.
   * @param cardId - Unique card ID in YGOProDeck
   * @returns Card data including Cloudinary image URLs
   * @throws Error if the card does not exist in YGOProDeck or has no images
   */
  selectCard(cardId: number): Promise<CardPreviewDTO>;

  /**
   * Confirms the selected cards by marking them as permanent.
   * Performs immediate cleanup by deleting temporary cards not included in the list.
   * Deletes Cloudinary images and DB records of unconfirmed cards.
   * @param cardIds - Array of card IDs to mark as permanent
   */
  confirmSelectedCards(cardIds: number[]): Promise<void>;

  /**
   * Cleans up old temporary cards (>24 hours).
   * Deletes Cloudinary images and DB records.
   * Used by a cron job to clean up resources from users who abandoned without confirming.
   * @returns Number of deleted cards
   */
  cleanupTemporaryCards(): Promise<number>;
}
