/**
 * Card entity stored in database with YGOProdeck direct URLs
 * Images are served directly from YGOProdeck CDN (https://images.ygoprodeck.com)
 * Each card is uniquely identified by its id (PRIMARY KEY prevents duplicates)
 */
export interface Card {
  id: number;
  name: string;
  imageUrl: string; // Direct URL from YGOProdeck API
  imageUrlSmall: string; // Direct URL from YGOProdeck API
  imageUrlCropped: string; // Direct URL from YGOProdeck API
  createdAt: string;
}

/**
 * Card search result from YGOPRODeck API
 * Contains direct URLs from YGOProdeck (for search preview purposes)
 */
export interface CardSearchResult {
  id: number;
  name: string;
  imageUrlExternal?: string;
  imageUrlSmallExternal?: string;
  imageUrlCroppedExternal?: string;
}

export interface CardPreviewDTO {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}
