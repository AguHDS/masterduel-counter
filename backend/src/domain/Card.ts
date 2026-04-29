/**
 * Card entity stored in database with local image URLs
 * Images are downloaded from YGOProdeck API and stored locally in backend/uploads/cards/
 * Images are served via /api/uploads/cards/{cardId}.jpg
 * Each card is uniquely identified by its id (PRIMARY KEY prevents duplicates)
 */
export interface Card {
  id: number;
  name: string;
  type?: string;
  desc?: string;
  race?: string;
  attribute?: string;
  atk?: number;
  def?: number;
  level?: number;
  scale?: number;
  linkval?: number;
  linkmarkers?: string;
  archetype?: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
  frameType?: string;
  createdAt: string;
}

/**
 * Card search result from YGOPRODeck API
 * Contains direct URLs from YGOProdeck (for temporary search preview purposes only)
 * These URLs are NOT saved to database - only used for search UI
 */
export interface CardSearchResult {
  id: number;
  name: string;
  imageUrlExternal?: string;
  imageUrlSmallExternal?: string;
  imageUrlCroppedExternal?: string;
  type?: string;
  desc?: string;
  race?: string;
  attribute?: string;
  atk?: number;
  def?: number;
  level?: number;
  scale?: number;
  linkval?: number;
  linkmarkers?: string[];
  archetype?: string;
  frameType?: string;
}

export interface CardPreviewDTO {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
  type?: string;
  desc?: string;
  race?: string;
  attribute?: string;
  atk?: number;
  def?: number;
  level?: number;
  scale?: number;
  linkval?: number;
  linkmarkers?: string;
  archetype?: string;
  frameType?: string;
}
