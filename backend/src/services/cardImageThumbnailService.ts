import { mkdir, access, writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { constants } from "fs";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Thumbnail cache directory - separate from main uploads
const THUMBNAIL_DIR = join(__dirname, "../../uploads/cards/thumbs");

// Backend base URL for generating absolute image URLs
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// Thumbnail dimensions for cropped card images
const THUMBNAIL_WIDTH = 100;
const THUMBNAIL_HEIGHT = 100;

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Service for generating and serving thumbnail versions of cropped card images
 * Thumbnails are generated on-demand and cached to disk for subsequent requests
 */
export class CardImageThumbnailService {
  /**
   * Initialize thumbnail cache directory if it doesn't exist
   */
  async ensureThumbnailDirectory(): Promise<void> {
    try {
      await mkdir(THUMBNAIL_DIR, { recursive: true });
    } catch (error) {
      console.error("Error creating thumbnail directory:", error);
      throw new Error("Failed to create thumbnail directory");
    }
  }

  /**
   * Get local filesystem path for a thumbnail
   */
  private getThumbnailPath(cardId: number, width: number, height: number): string {
    return join(THUMBNAIL_DIR, `${cardId}_cropped_${width}x${height}.jpg`);
  }

  /**
   * Get path to the original cropped image
   */
  private getOriginalCroppedPath(cardId: number): string {
    const uploadsDir = join(__dirname, "../../uploads/cards");
    return join(uploadsDir, `${cardId}_cropped.jpg`);
  }

  /**
   * Get API URL for a thumbnail
   */
  getApiThumbnailUrl(cardId: number, width: number = THUMBNAIL_WIDTH, height: number = THUMBNAIL_HEIGHT): string {
    return `${BACKEND_URL}/api/uploads/cards/thumb/${cardId}_${width}x${height}.jpg`;
  }

  /**
   * Check if thumbnail already exists in cache
   */
  async thumbnailExists(cardId: number, width: number, height: number): Promise<boolean> {
    try {
      const thumbnailPath = this.getThumbnailPath(cardId, width, height);
      await access(thumbnailPath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate thumbnail from original cropped image
   * Uses sharp for high-quality, efficient image resizing
   */
  async generateThumbnail(
    cardId: number,
    options: ThumbnailOptions = {}
  ): Promise<Buffer> {
    const { 
      width = THUMBNAIL_WIDTH, 
      height = THUMBNAIL_HEIGHT,
      quality = 85 
    } = options;

    // Ensure thumbnail directory exists
    await this.ensureThumbnailDirectory();

    // Check if thumbnail already exists
    const thumbnailPath = this.getThumbnailPath(cardId, width, height);
    const exists = await this.thumbnailExists(cardId, width, height);

    if (exists) {
      // Return cached thumbnail
      return await readFile(thumbnailPath);
    }

    // Get original cropped image path
    const originalPath = this.getOriginalCroppedPath(cardId);

    try {
      // Check if original exists
      await access(originalPath, constants.F_OK);
    } catch {
      throw new Error(`Original cropped image not found for card ${cardId}`);
    }

    // Generate thumbnail using sharp
    try {
      const thumbnailBuffer = await sharp(originalPath)
        .resize(width, height, {
          fit: 'cover', // Cover the dimensions, cropping if necessary
          position: 'center'
        })
        .jpeg({ 
          quality,
          mozjpeg: true // Use mozjpeg for better compression
        })
        .toBuffer();

      // Cache thumbnail to disk for future requests
      await writeFile(thumbnailPath, thumbnailBuffer);

      return thumbnailBuffer;
    } catch (error) {
      throw new Error(
        `Failed to generate thumbnail for card ${cardId}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get thumbnail buffer (from cache or generate new)
   */
  async getThumbnail(
    cardId: number,
    options: ThumbnailOptions = {}
  ): Promise<Buffer> {
    return this.generateThumbnail(cardId, options);
  }

  /**
   * Pre-generate thumbnails for multiple cards (batch operation)
   * Useful for warming up cache or during deployment
   */
  async batchGenerateThumbnails(
    cardIds: number[],
    options: ThumbnailOptions = {}
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const cardId of cardIds) {
      try {
        await this.generateThumbnail(cardId, options);
        success++;
      } catch (error) {
        console.error(`Failed to generate thumbnail for card ${cardId}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }
}
