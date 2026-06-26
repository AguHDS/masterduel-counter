import { mkdir, writeFile, access } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { constants } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// uploads/cards/ is at backend/uploads/cards/
// When compiled, this file is at backend/dist/services/cardImageStorageService.js
const UPLOADS_DIR = join(__dirname, "../../uploads/cards");

// Backend base URL for generating absolute image URLs
// In development: http://localhost:3001
// In production: https://masterduelcounter.com
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export type ImageType = "normal" | "small" | "cropped";

export interface CardImageUrls {
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

/**
 * Service for managing card image storage in local filesystem
 * Handles downloading, saving, and serving card images from VPS
 */
export class CardImageStorageService {
  /**
   * Initialize uploads directory if it doesn't exist
   */
  async ensureUploadsDirectory(): Promise<void> {
    try {
      await mkdir(UPLOADS_DIR, { recursive: true });
    } catch (error) {
      console.error("Error creating uploads directory:", error);
      throw new Error("Failed to create uploads directory");
    }
  }

  /**
   * Get local filesystem path for a card image
   */
  getLocalFilePath(cardId: number, type: ImageType): string {
    const suffix = type === "normal" ? "" : `_${type}`;
    return join(UPLOADS_DIR, `${cardId}${suffix}.jpg`);
  }

  /**
   * Get API URL path for a card image (what frontend will use)
   * Returns absolute URL including backend domain
   */
  getApiImageUrl(cardId: number, type: ImageType): string {
    const suffix = type === "normal" ? "" : `_${type}`;
    return `${BACKEND_URL}/api/uploads/cards/${cardId}${suffix}.jpg`;
  }

  /**
   * Check if all image versions exist for a card
   */
  async imageExists(cardId: number): Promise<boolean> {
    try {
      const normalPath = this.getLocalFilePath(cardId, "normal");
      const smallPath = this.getLocalFilePath(cardId, "small");
      const croppedPath = this.getLocalFilePath(cardId, "cropped");

      await access(normalPath, constants.F_OK);
      await access(smallPath, constants.F_OK);
      await access(croppedPath, constants.F_OK);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if the small image exists for a card (optimized for search results)
   * This is more permissive than imageExists() and handles partial downloads.
   * Only checks _small.jpg since that's what search grids display.
   */
  async imageExistsForSearch(cardId: number): Promise<boolean> {
    try {
      const smallPath = this.getLocalFilePath(cardId, "small");
      await access(smallPath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Download image from external URL and return as Buffer
   */
  async downloadImage(url: string): Promise<Buffer> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Image download timeout");
      }
      throw new Error(`Failed to download image from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Save image buffer to local filesystem
   */
  async saveImage(cardId: number, type: ImageType, imageBuffer: Buffer): Promise<void> {
    const filePath = this.getLocalFilePath(cardId, type);

    try {
      await writeFile(filePath, imageBuffer);
    } catch (error) {
      throw new Error(`Failed to save ${type} image for card ${cardId}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Download and save all three versions of a card image
   * Returns API URLs for frontend consumption
   * 
   * RESILIENT MODE: If some images fail (404), continues with available ones.
   * Only throws error if ALL three images fail.
   */
  async downloadAndSaveCardImages(
    cardId: number,
    externalUrls: { normal: string; small: string; cropped: string }
  ): Promise<CardImageUrls> {
    // Ensure directory exists
    await this.ensureUploadsDirectory();

    // Check if images already exist (prevent duplicates)
    const exists = await this.imageExists(cardId);
    if (exists) {
      return {
        imageUrl: this.getApiImageUrl(cardId, "normal"),
        imageUrlSmall: this.getApiImageUrl(cardId, "small"),
        imageUrlCropped: this.getApiImageUrl(cardId, "cropped"),
      };
    }

    // Download each image individually with error tolerance
    const downloadResults = await Promise.allSettled([
      this.downloadImage(externalUrls.normal).then(buffer => ({ type: 'normal' as const, buffer })),
      this.downloadImage(externalUrls.small).then(buffer => ({ type: 'small' as const, buffer })),
      this.downloadImage(externalUrls.cropped).then(buffer => ({ type: 'cropped' as const, buffer })),
    ]);

    // Separate successful and failed downloads
    const successfulDownloads: Array<{ type: ImageType; buffer: Buffer }> = [];
    const failedDownloads: Array<{ type: ImageType; error: string }> = [];

    downloadResults.forEach((result, index) => {
      const types: ImageType[] = ['normal', 'small', 'cropped'];
      const type = types[index];

      if (result.status === 'fulfilled') {
        successfulDownloads.push(result.value);
      } else {
        failedDownloads.push({ type, error: result.reason?.message || 'Unknown error' });
      }
    });

    // If ALL downloads failed, throw error
    if (successfulDownloads.length === 0) {
      const errorMsg = failedDownloads.map(f => `${f.type}: ${f.error}`).join(', ');
      throw new Error(`Failed to download ANY images for card ${cardId}: ${errorMsg}`);
    }

    // Save successful downloads
    try {
      await Promise.all(
        successfulDownloads.map(({ type, buffer }) => this.saveImage(cardId, type, buffer))
      );

      // Log partial failures (warnings, not errors)
      if (failedDownloads.length > 0) {
        console.warn(
          `Card ${cardId}: Saved ${successfulDownloads.length}/3 images. ` +
          `Failed: ${failedDownloads.map(f => f.type).join(', ')} (likely 404 - card may be token/special)`
        );
      }

      return {
        imageUrl: this.getApiImageUrl(cardId, "normal"),
        imageUrlSmall: this.getApiImageUrl(cardId, "small"),
        imageUrlCropped: this.getApiImageUrl(cardId, "cropped"),
      };
    } catch (error) {
      console.error(`Error saving images for card ${cardId}:`, error);
      throw error;
    }
  }

  /**
   * Get local image URLs if they exist, otherwise return null
   */
  async getLocalImageUrls(cardId: number): Promise<CardImageUrls | null> {
    const exists = await this.imageExists(cardId);
    
    if (!exists) {
      return null;
    }

    return {
      imageUrl: this.getApiImageUrl(cardId, "normal"),
      imageUrlSmall: this.getApiImageUrl(cardId, "small"),
      imageUrlCropped: this.getApiImageUrl(cardId, "cropped"),
    };
  }
}
