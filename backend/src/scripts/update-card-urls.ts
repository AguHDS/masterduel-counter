/**
 * Script to update card image URLs from relative to absolute
 * 
 * This script updates existing relative URLs (/api/uploads/...) to absolute URLs
 * (http://localhost:3001/api/uploads/... or https://masterduelcounter.com/api/uploads/...)
 * based on BACKEND_URL environment variable
 * 
 * Usage:
 *   npm run update-urls
 */

import { createYugiohDatabase } from "../database/database.js";
import { SqliteCardRepository } from "../infrastructure/repositories/SqliteCardRepository.js";
import dotenv from "dotenv";

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function updateCardUrls() {
  console.log("🚀 Starting card URL update...\n");
  console.log(`📍 Backend URL: ${BACKEND_URL}\n`);

  const db = createYugiohDatabase();
  const cardRepository = new SqliteCardRepository(db.getConnection());

  try {
    // Get all cards from database
    const allCards = await cardRepository.getAllCards();
    console.log(`📦 Found ${allCards.length} cards in database\n`);

    if (allCards.length === 0) {
      console.log("✅ No cards to update");
      return;
    }

    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      const progress = `[${i + 1}/${allCards.length}]`;

      // Check if URL is relative (starts with /api/)
      const isRelative = card.imageUrl.startsWith("/api/");

      if (!isRelative) {
        // Check if it's already absolute with current BACKEND_URL
        const isCorrectAbsolute = card.imageUrl.startsWith(`${BACKEND_URL}/api/`);
        
        if (isCorrectAbsolute) {
          console.log(`${progress} ⏭️  Skipped: ${card.name} (already has correct absolute URL)`);
          skipped++;
          continue;
        }

        // If it's absolute but with wrong domain, update it
        // Extract the /api/uploads/cards/... part
        const relativePathMatch = card.imageUrl.match(/(\/api\/uploads\/cards\/.+)/);
        if (!relativePathMatch) {
          console.log(`${progress} ⏭️  Skipped: ${card.name} (not a local URL)`);
          skipped++;
          continue;
        }

        // Update to new absolute URL
        const relativePath = relativePathMatch[1];
        const newImageUrl = `${BACKEND_URL}${relativePath}`;
        const newImageUrlSmall = `${BACKEND_URL}${card.imageUrlSmall.match(/(\/api\/uploads\/cards\/.+)/)?.[1] || card.imageUrlSmall}`;
        const newImageUrlCropped = `${BACKEND_URL}${card.imageUrlCropped.match(/(\/api\/uploads\/cards\/.+)/)?.[1] || card.imageUrlCropped}`;

        await cardRepository.saveOrUpdateCard({
          ...card,
          imageUrl: newImageUrl,
          imageUrlSmall: newImageUrlSmall,
          imageUrlCropped: newImageUrlCropped,
        });

        console.log(`${progress} ✅ Updated: ${card.name}`);
        updated++;
        continue;
      }

      // Convert relative to absolute
      const newImageUrl = `${BACKEND_URL}${card.imageUrl}`;
      const newImageUrlSmall = `${BACKEND_URL}${card.imageUrlSmall}`;
      const newImageUrlCropped = `${BACKEND_URL}${card.imageUrlCropped}`;

      await cardRepository.saveOrUpdateCard({
        ...card,
        imageUrl: newImageUrl,
        imageUrlSmall: newImageUrlSmall,
        imageUrlCropped: newImageUrlCropped,
      });

      console.log(`${progress} ✅ Updated: ${card.name}`);
      updated++;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Update Summary:");
    console.log(`   ✅ Updated: ${updated} cards`);
    console.log(`   ⏭️  Skipped: ${skipped} cards (already correct)`);
    console.log("=".repeat(60));

    console.log("\n🎉 URL update completed successfully!");
  } catch (error) {
    console.error("❌ Error during URL update:", error);
    process.exit(1);
  } finally {
    db.close();
    console.log("\n✨ Script finished");
  }
}

updateCardUrls().catch(console.error);
