/**
 * Card entity stored in database with Cloudinary-hosted images
 * 
 * isTemporary: Failsafe flag for crash recovery DURING save process
 * Flow:
 * 1. User selects cards → Cards stored in browser memory (NOT in DB)
 * 2. User clicks Save → confirmSelectedCards starts:
 *    - Creates cards with isTemporary=true
 *    - Uploads images to Cloudinary
 *    - Marks cards as isTemporary=false
 * 3. If server crashes during step 2, some cards remain temporary
 * 4. Cron job cleans temporary cards older than 24h
 * 
 * NOTE: Cards selected but never saved don't create temporary records.
 */
export interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
  cloudinaryPublicId: string;
  cloudinaryPublicIdSmall: string;
  cloudinaryPublicIdCropped: string;
  isTemporary: boolean; // Failsafe flag for cleanup
  createdAt: string;
}

/**
 * Card search result from YGOPRODeck API
 * Uses external URLs (not uploaded to Cloudinary yet)
 */
export interface CardSearchResult {
  id: number;
  name: string;
  imageUrlExternal?: string;
  imageUrlSmallExternal?: string;
}

export interface CardPreviewDTO {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

export interface CardCreateDTO {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
  cloudinaryPublicId: string;
  cloudinaryPublicIdSmall: string;
  cloudinaryPublicIdCropped: string;
  isTemporary: boolean;
}
