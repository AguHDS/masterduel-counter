/**
 * Script to download ALL YGOProDeck card images to local storage
 * 
 * This script:
 * 1. Fetches complete card list from YGOProDeck API (~13,000+ cards)
 * 2. Extracts only IDs and image URLs (memory-efficient for 1GB RAM VPS)
 * 3. Checks which cards already exist locally (skip duplicates)
 * 4. Downloads missing cards sequentially with retry logic
 * 5. Cleans up incomplete downloads (cards with 1-2 files instead of 3)
 * 6. Tracks progress, memory usage, and generates final statistics
 * 
 * Features:
 * - Sequential downloads (memory-safe for 1GB RAM VPS)
 * - Retry logic with exponential backoff (3 retries: 1s, 2s, 4s)
 * - Resume capability (skips already-downloaded cards)
 * - Memory monitoring (warns at >700MB usage)
 * - CLI argument: --limit N (for testing, downloads only first N cards)
 * 
 * Usage:
 *   npm run download-all-cards              # Download all cards (no delay)
 *   npm run download-all-cards -- --limit 100   # Download only first 100 (testing)
 *   npm run download-all-cards -- --delay 250    # 250ms delay between cards (VPS)
 * 
 * VPS Prerequisites:
 *   - Stop backend first: pm2 stop all (to free RAM)
 *   - Check disk space: df -h (needs ~5GB free)
 *   - Monitor with: htop (in separate terminal)
 * 
 * Estimated time: 3-4 hours for full download on 1GB RAM VPS
 */

import { CardImageStorageService } from "../services/cardImageStorageService.js";
import { access, unlink } from "fs/promises";
import { constants } from "fs";

interface CardImageData {
  id: number;
  normalUrl: string;
  smallUrl: string;
  croppedUrl: string;
}

interface DownloadStats {
  total: number;
  downloaded: number;
  skipped: number;
  failed: number;
  cleanedUp: number;
  startTime: number;
  totalBytes: number;
}

/**
 * Parse CLI arguments
 */
function parseArgs(): { limit: number | null; delay: number } {
  const args = process.argv.slice(2);
  const limitIndex = args.indexOf("--limit");
  const delayIndex = args.indexOf("--delay");

  let limit: number | null = null;
  let delay = 0;

  if (limitIndex !== -1 && args[limitIndex + 1]) {
    const parsed = parseInt(args[limitIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      limit = parsed;
    }
  }

  if (delayIndex !== -1 && args[delayIndex + 1]) {
    const parsed = parseInt(args[delayIndex + 1], 10);
    if (!isNaN(parsed) && parsed >= 0) {
      delay = parsed;
    }
  }

  return { limit, delay };
}

/**
 * Get current memory usage in MB
 */
function getMemoryUsageMB(): number {
  const usage = process.memoryUsage();
  return Math.round(usage.heapUsed / 1024 / 1024);
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format time duration in human-readable string
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Fetch all cards from YGOProDeck API and extract only IDs and image URLs
 * This is memory-efficient: we discard the large JSON immediately after extraction
 */
async function fetchAllCardImages(): Promise<CardImageData[]> {
  console.log("Fetching card list from YGOProDeck API...");
  console.log("Memory before fetch:", getMemoryUsageMB(), "MB");
  
  try {
    const response = await fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php", {
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid API response format");
    }
    
    console.log(`Received ${data.data.length} cards from API`);
    console.log("Memory after JSON parse:", getMemoryUsageMB(), "MB");
    
    // Extract only what we need (IDs and URLs) - discard everything else
    const cardImages: CardImageData[] = data.data
      .filter((card: { card_images?: { image_url: string; image_url_small: string; image_url_cropped: string }[] }) => card.card_images && card.card_images[0])
      .map((card: { id: number; card_images: { image_url: string; image_url_small: string; image_url_cropped: string }[] }) => ({
        id: card.id,
        normalUrl: card.card_images[0].image_url,
        smallUrl: card.card_images[0].image_url_small,
        croppedUrl: card.card_images[0].image_url_cropped,
      }));
    
    console.log(`Extracted ${cardImages.length} cards with valid images`);
    console.log("Memory after extraction:", getMemoryUsageMB(), "MB");
    console.log("Card list fetched successfully\n");
    
    return cardImages;
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("API request timeout - YGOProDeck API is not responding");
    }
    throw new Error(`Failed to fetch card list: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Check if a specific image file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check card image completeness and clean up incomplete downloads
 * Returns true if card needs to be downloaded
 */
async function checkAndCleanupCard(
  cardId: number,
  imageStorage: CardImageStorageService
): Promise<{ needsDownload: boolean; cleanedUp: boolean }> {
  const normalPath = imageStorage.getLocalFilePath(cardId, "normal");
  const smallPath = imageStorage.getLocalFilePath(cardId, "small");
  const croppedPath = imageStorage.getLocalFilePath(cardId, "cropped");
  
  const [hasNormal, hasSmall, hasCropped] = await Promise.all([
    fileExists(normalPath),
    fileExists(smallPath),
    fileExists(croppedPath),
  ]);
  
  const fileCount = [hasNormal, hasSmall, hasCropped].filter(Boolean).length;
  
  // All 3 files exist - skip download
  if (fileCount === 3) {
    return { needsDownload: false, cleanedUp: false };
  }
  
  // No files exist - needs download
  if (fileCount === 0) {
    return { needsDownload: true, cleanedUp: false };
  }
  
  // Incomplete download (1-2 files) - clean up and re-download
  console.log(`   Card ${cardId} has incomplete files (${fileCount}/3), cleaning up...`);
  
  const deletePromises = [];
  if (hasNormal) deletePromises.push(unlink(normalPath));
  if (hasSmall) deletePromises.push(unlink(smallPath));
  if (hasCropped) deletePromises.push(unlink(croppedPath));
  
  await Promise.all(deletePromises);
  
  return { needsDownload: true, cleanedUp: true };
}

/**
 * Download a single card with retry logic
 * Returns the total bytes downloaded, or null if failed
 */
async function downloadCardWithRetry(
  card: CardImageData,
  imageStorage: CardImageStorageService,
  maxRetries: number = 3
): Promise<number | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Download all 3 versions
      await imageStorage.downloadAndSaveCardImages(card.id, {
        normal: card.normalUrl,
        small: card.smallUrl,
        cropped: card.croppedUrl,
      });
      
      // Calculate approximate size (we don't have exact size, estimate based on typical card images)
      // Normal: ~150KB, Small: ~50KB, Cropped: ~30KB = ~230KB per card
      const estimatedBytes = 230 * 1024;
      
      return estimatedBytes;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = 1000 * Math.pow(2, attempt - 1);
        console.log(`   Retry ${attempt}/${maxRetries} after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // All retries failed
  console.error(` Failed after ${maxRetries} retries: ${lastError?.message}`);
  return null;
}

/**
 * Main download function
 */
async function downloadAllCards() {
  console.log(" Starting YGOProDeck Card Download Script\n");
  console.log("=" .repeat(70));
  
  const { limit, delay } = parseArgs();
  
  if (limit) {
    console.log(`TEST MODE: Downloading only first ${limit} cards`);
    console.log("=" .repeat(70) + "\n");
  }
  
  const imageStorage = new CardImageStorageService();
  const stats: DownloadStats = {
    total: 0,
    downloaded: 0,
    skipped: 0,
    failed: 0,
    cleanedUp: 0,
    startTime: Date.now(),
    totalBytes: 0,
  };
  
  try {
    // Step 1: Ensure uploads directory exists
    await imageStorage.ensureUploadsDirectory();
    
    // Step 2: Fetch all cards from API
    let allCards = await fetchAllCardImages();
    
    // Apply limit if specified
    if (limit) {
      allCards = allCards.slice(0, limit);
    }
    
    stats.total = allCards.length;
    
    console.log(`Download Plan:`);
    console.log(`Total cards to process: ${stats.total}`);
    console.log(`Delay between cards: ${delay}ms`);
    console.log(`Initial memory usage: ${getMemoryUsageMB()} MB`);
    console.log(`Estimated time: ${formatDuration(stats.total * delay)} (sequential with ${delay}ms delays)`);
    console.log(`Estimated size: ${formatBytes(stats.total * 230 * 1024)}\n`);
    
    console.log("🔄 Starting downloads...\n");
    
    // Step 3: Process each card sequentially
    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      const progress = `[${i + 1}/${stats.total}]`;
      const percentage = ((i + 1) / stats.total * 100).toFixed(1);
      
      // Check if card needs download (and cleanup if incomplete)
      const { needsDownload, cleanedUp } = await checkAndCleanupCard(card.id, imageStorage);
      
      if (cleanedUp) {
        stats.cleanedUp++;
      }
      
      if (!needsDownload) {
        console.log(`${progress} Skipped: ${card.id} (${percentage}%)`);
        stats.skipped++;
      } else {
        // Download the card
        console.log(`${progress} Downloading: ${card.id} (${percentage}%)`);
        
        const bytes = await downloadCardWithRetry(card, imageStorage);
        
        if (bytes !== null) {
          stats.downloaded++;
          stats.totalBytes += bytes;
          console.log(`${progress} Downloaded: ${card.id}`);
        } else {
          stats.failed++;
          console.log(`${progress} Failed: ${card.id}`);
        }
      }
      
      // Memory monitoring every 100 cards
      if ((i + 1) % 100 === 0) {
        const memoryMB = getMemoryUsageMB();
        const elapsed = Date.now() - stats.startTime;
        const cardsPerSec = (i + 1) / (elapsed / 1000);
        const remaining = stats.total - (i + 1);
        const etaMs = remaining / cardsPerSec * 1000;
        
        console.log(`\n Progress Update:`);
        console.log(`Processed: ${i + 1}/${stats.total} (${percentage}%)`);
        console.log(`Memory: ${memoryMB} MB`);
        console.log(`Speed: ${cardsPerSec.toFixed(2)} cards/sec`);
        console.log(`ETA: ${formatDuration(etaMs)}`);
        console.log(`Downloaded: ${stats.downloaded} | Skipped: ${stats.skipped} | Failed: ${stats.failed}`);
        
        if (memoryMB > 700) {
          console.log(`WARNING: High memory usage (${memoryMB} MB > 700 MB threshold)`);
          console.log(`Consider stopping and restarting if memory continues to grow`);
        }
        
        console.log();
      }
      
      // Delay between downloads (configurable, default 0ms)
      if (i < allCards.length - 1 && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Step 4: Print final summary
    const totalTime = Date.now() - stats.startTime;
    
    console.log("\n" + "=".repeat(70));
    console.log("Download Summary:");
    console.log("=".repeat(70));
    console.log(`Total cards processed: ${stats.total}`);
    console.log(`Downloaded: ${stats.downloaded} cards`);
    console.log(`Skipped: ${stats.skipped} cards (already exist)`);
    console.log(`Failed: ${stats.failed} cards`);
    console.log(`Cleaned up: ${stats.cleanedUp} incomplete downloads`);
    console.log(`Total size: ${formatBytes(stats.totalBytes)}`);
    console.log(`Total time: ${formatDuration(totalTime)}`);
    console.log(`Average speed: ${(stats.total / (totalTime / 1000)).toFixed(2)} cards/sec`);
    console.log(`Final memory: ${getMemoryUsageMB()} MB`);
    console.log("=".repeat(70));
    
    if (stats.failed > 0) {
      console.log(`\n ${stats.failed} cards failed to download.`);
      console.log(`You can re-run this script to retry failed cards.`);
    } else if (stats.downloaded > 0) {
      console.log(`\n All cards downloaded successfully!`);
    } else {
      console.log(`\n All cards were already downloaded. Nothing to do!`);
    }
    
    if (limit) {
      console.log(`\n Note: This was a test run with --limit ${limit}`);
      console.log(`Remove the --limit flag to download all cards.`);
    }
    
  } catch (error) {
    console.error("\n Script failed with error:");
    console.error(error);
    process.exit(1);
  }
}

// Run the script
downloadAllCards()
  .then(() => {
    console.log("\n Script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n Unexpected error:", error);
    process.exit(1);
  });
