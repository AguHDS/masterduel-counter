/**
 * Script to update existing cards with complete card details
 * Fetches missing fields (type, desc, race, attribute, atk, def, scale, linkval, linkmarkers, archetype)
 * from YGOProdeck API for cards already in database
 */

import { getDependencies } from "../compositionRoot.js";
import "dotenv/config";

const DELAY_BETWEEN_REQUESTS = 100; // 100ms delay to avoid rate limiting
const BATCH_SIZE = 50; // Process in batches

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateCardDetails() {
  console.log("[Update Card Details] Starting update...\n");

  const dependencies = getDependencies();
  const cardRepository = dependencies.getCardRepository();
  const cardDetailsApi = dependencies.getCardDetailsApiService();

  // Get all cards from database
  const allCards = await cardRepository.getAllCards();
  console.log(`[Update Card Details] Found ${allCards.length} cards in database\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i];
    
    // Check if card already has all details (type, desc, race are required fields)
    if (card.type && card.desc && card.race) {
      skippedCount++;
      console.log(
        `[${i + 1}/${allCards.length}] ⏭️  Skipped: ${card.name} (ID: ${card.id}) - already has details`
      );
      continue;
    }

    try {
      // Fetch complete card details from YGOProdeck API
      console.log(
        `[${i + 1}/${allCards.length}] 🔄 Fetching details for: ${card.name} (ID: ${card.id})`
      );

      const cardDetails = await cardDetailsApi.getCardDetailsFromExternalApi(card.id);

      if (!cardDetails) {
        errorCount++;
        console.log(
          `[${i + 1}/${allCards.length}] ❌ Card not found in API: ${card.name} (ID: ${card.id})`
        );
        continue;
      }

      // Update card with complete details
      const updatedCard = {
        ...card,
        type: cardDetails.type,
        desc: cardDetails.desc,
        race: cardDetails.race,
        attribute: cardDetails.attribute,
        atk: cardDetails.atk,
        def: cardDetails.def,
        level: cardDetails.level,
        scale: cardDetails.scale,
        linkval: cardDetails.linkval,
        linkmarkers: cardDetails.linkmarkers ? JSON.stringify(cardDetails.linkmarkers) : undefined,
        archetype: cardDetails.archetype,
      };

      await cardRepository.saveOrUpdateCard(updatedCard);
      updatedCount++;
      console.log(
        `[${i + 1}/${allCards.length}] ✅ Updated: ${card.name} (ID: ${card.id})`
      );

      // Delay to avoid rate limiting
      if ((i + 1) % BATCH_SIZE === 0) {
        console.log(`\n⏸️  Processed ${i + 1} cards, pausing for 1 second...\n`);
        await delay(1000);
      } else {
        await delay(DELAY_BETWEEN_REQUESTS);
      }
    } catch (error) {
      errorCount++;
      console.error(
        `[${i + 1}/${allCards.length}] ❌ Error updating card ${card.id}:`,
        error instanceof Error ? error.message : error
      );
      await delay(DELAY_BETWEEN_REQUESTS);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("[Update Card Details] Summary:");
  console.log(`  Total cards: ${allCards.length}`);
  console.log(`  ✅ Updated: ${updatedCount}`);
  console.log(`  ⏭️  Skipped: ${skippedCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log("=".repeat(60) + "\n");
}

updateCardDetails()
  .then(() => {
    console.log("✅ Card details update completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
