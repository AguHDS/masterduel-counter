/**
 * Script to pre-generate thumbnails for all existing cropped card images
 * 
 * This script:
 * 1. Scans uploads/cards directory for all _cropped.jpg files
 * 2. Generates 100x100 thumbnails for each card
 * 3. Caches them in uploads/cards/thumbs directory
 * 
 * Usage:
 *   npm run generate-thumbnails
 * 
 * Run this in production AFTER deploying the thumbnail feature
 * to warm up the thumbnail cache and avoid on-demand generation delays
 * for the first users.
 * 
 * VPS Prerequisites:
 *   - Stop backend first: pm2 stop all (to free RAM)
 *   - Check disk space: df -h (thumbnails will use ~100-200MB)
 * 
 * Estimated time: 10-20 minutes for ~13,000 cards
 */

import { readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { CardImageThumbnailService } from "../services/cardImageThumbnailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPLOADS_DIR = join(__dirname, "../../uploads/cards");
const thumbnailService = new CardImageThumbnailService();

interface GenerationStats {
  total: number;
  generated: number;
  skipped: number;
  failed: number;
  startTime: number;
}

/**
 * Get current memory usage in MB
 */
function getMemoryUsageMB(): number {
  const usage = process.memoryUsage();
  return Math.round(usage.heapUsed / 1024 / 1024);
}

/**
 * Format time duration in human-readable string
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Print progress update
 */
function printProgress(stats: GenerationStats): void {
  const elapsed = Date.now() - stats.startTime;
  const processed = stats.generated + stats.skipped + stats.failed;
  const percentage = ((processed / stats.total) * 100).toFixed(1);
  const memoryMB = getMemoryUsageMB();

  console.log(
    `Progress: ${processed}/${stats.total} (${percentage}%) | ` +
    `Generated: ${stats.generated} | Skipped: ${stats.skipped} | Failed: ${stats.failed} | ` +
    `Memory: ${memoryMB}MB | Elapsed: ${formatDuration(elapsed)}`
  );
}

/**
 * Scan uploads directory and extract card IDs from cropped images
 */
async function getCardIds(): Promise<number[]> {
  console.log("Scanning uploads directory for cropped images...");

  const files = await readdir(UPLOADS_DIR);
  const cardIds: number[] = [];

  for (const file of files) {
    // Match files like "12345_cropped.jpg"
    const match = file.match(/^(\d+)_cropped\.jpg$/);
    if (match) {
      cardIds.push(parseInt(match[1], 10));
    }
  }

  return cardIds.sort((a, b) => a - b);
}

/**
 * Generate thumbnails for all cards
 */
async function generateAllThumbnails(): Promise<void> {
  console.log("=".repeat(60));
  console.log("Card Image Thumbnail Generation Script");
  console.log("=".repeat(60));
  console.log();

  // Get all card IDs
  const cardIds = await getCardIds();
  console.log(`Found ${cardIds.length} cropped card images\n`);

  if (cardIds.length === 0) {
    console.log("No cropped images found. Exiting.");
    return;
  }

  const stats: GenerationStats = {
    total: cardIds.length,
    generated: 0,
    skipped: 0,
    failed: 0,
    startTime: Date.now(),
  };

  console.log("Starting thumbnail generation...\n");

  // Generate thumbnails one by one
  for (let i = 0; i < cardIds.length; i++) {
    const cardId = cardIds[i];

    try {
      // Check if thumbnail already exists
      const exists = await thumbnailService.thumbnailExists(cardId, 100, 100);

      if (exists) {
        stats.skipped++;
      } else {
        // Generate thumbnail
        await thumbnailService.generateThumbnail(cardId, {
          width: 100,
          height: 100,
          quality: 85,
        });
        stats.generated++;
      }

      // Print progress every 100 cards
      if ((i + 1) % 100 === 0) {
        printProgress(stats);
      }
    } catch (error) {
      stats.failed++;
      console.error(`Failed to generate thumbnail for card ${cardId}:`, error);
    }

    // Memory check - warn if usage is high
    const memoryMB = getMemoryUsageMB();
    if (memoryMB > 700) {
      console.warn(`⚠️  High memory usage detected: ${memoryMB}MB`);
    }
  }

  // Final report
  console.log("\n" + "=".repeat(60));
  console.log("Thumbnail Generation Complete");
  console.log("=".repeat(60));
  printProgress(stats);
  console.log();

  if (stats.failed > 0) {
    console.warn(`⚠️  ${stats.failed} thumbnails failed to generate`);
    console.warn("This is expected for tokens and special cards without cropped versions");
  } else {
    console.log("✅ All thumbnails generated successfully!");
  }
}

// Run the script
generateAllThumbnails()
  .then(() => {
    console.log("\nScript completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed with error:");
    console.error(error);
    process.exit(1);
  });
