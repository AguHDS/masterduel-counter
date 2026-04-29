/**
 * Script to migrate existing card images from YGOProdeck hotlinks to local storage
 * 
 * This script:
 * 1. Reads all cards from the database
 * 2. For each card with external YGOProdeck URLs
 * 3. Downloads the images (normal, small, cropped) from YGOProdeck
 * 4. Saves them to backend/uploads/cards/
 * 5. Updates database with local URLs
 * 
 * Usage:
 *   npm run migrate-images
 * 
 * Run this ONCE after deploying the new code to VPS
 */

import { createYugiohDatabase } from "../database/database.js";
import { SqliteCardRepository } from "../infrastructure/repositories/SqliteCardRepository.js";
import { CardImageStorageService } from "../services/cardImageStorageService.js";

async function migrateCardImages() {
  console.log("🚀 Starting card image migration...\n");

  const db = createYugiohDatabase();
  const cardRepository = new SqliteCardRepository(db.getConnection());
  const imageStorage = new CardImageStorageService();

  try {
    // Get all cards from database
    const allCards = await cardRepository.getAllCards();
    console.log(`📦 Found ${allCards.length} cards in database\n`);

    if (allCards.length === 0) {
      console.log("✅ No cards to migrate");
      return;
    }

    // Ensure uploads directory exists
    await imageStorage.ensureUploadsDirectory();

    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      const progress = `[${i + 1}/${allCards.length}]`;

      // Check if this card has YGOProdeck URLs (starts with https://images.ygoprodeck.com)
      const hasExternalUrls = 
        card.imageUrl.startsWith("https://images.ygoprodeck.com") ||
        card.imageUrl.startsWith("http://images.ygoprodeck.com");

      if (!hasExternalUrls) {
        console.log(`${progress} ⏭️  Skipped: ${card.name} (already has local URLs)`);
        skipped++;
        continue;
      }

      try {
        console.log(`${progress} 📥 Downloading: ${card.name} (ID: ${card.id})`);

        // Download and save images
        const localUrls = await imageStorage.downloadAndSaveCardImages(card.id, {
          normal: card.imageUrl,
          small: card.imageUrlSmall,
          cropped: card.imageUrlCropped,
        });

        // Update database with local URLs
        await cardRepository.saveOrUpdateCard({
          ...card,
          imageUrl: localUrls.imageUrl,
          imageUrlSmall: localUrls.imageUrlSmall,
          imageUrlCropped: localUrls.imageUrlCropped,
        });

        console.log(`${progress} ✅ Migrated: ${card.name}`);
        migrated++;
      } catch (error) {
        console.error(`${progress} ❌ Failed: ${card.name}`);
        console.error(`   Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        failed++;
      }

      // Small delay to avoid overwhelming the API
      if (i < allCards.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log(`   ✅ Migrated: ${migrated} cards`);
    console.log(`   ⏭️  Skipped:  ${skipped} cards (already local)`);
    console.log(`   ❌ Failed:   ${failed} cards`);
    console.log("=".repeat(60));

    if (failed > 0) {
      console.log("\n⚠️  Some cards failed to migrate. You can re-run this script to retry.");
    } else {
      console.log("\n🎉 Migration completed successfully!");
    }
  } catch (error) {
    console.error("\n❌ Migration failed with error:");
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
migrateCardImages()
  .then(() => {
    console.log("\n✨ Script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Unexpected error:", error);
    process.exit(1);
  });
