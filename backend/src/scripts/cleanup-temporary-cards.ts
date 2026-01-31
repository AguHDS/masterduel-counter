import { getDependencies } from "../compositionRoot";

/**
 * FAILSAFE CLEANUP SCRIPT
 * 
 * Removes temporary cards older than 24 hours from the database and Cloudinary.
 * 
 * WHY THIS EXISTS:
 * - Cards are created as temporary during confirmSelectedCards when they don't exist
 * - If the server crashes or user never completes save, these cards remain temporary
 * - This script acts as a failsafe to clean up orphaned temporary cards
 * 
 * WHEN IT RUNS:
 * - Automatically via cron job every day at 3:00 AM
 * - Manually via: npm run cleanup-temporary-cards
 * 
 * EXPECTED BEHAVIOR:
 * - Normally finds 0 cards (means all cards were properly confirmed)
 * - Finding cards indicates a crash, bug, or user cancellation
 */
async function cleanupTemporaryCards() {
  console.log("=".repeat(60));
  console.log("TEMPORARY CARDS CLEANUP - FAILSAFE");
  console.log("=".repeat(60));
  console.log("Looking for temporary cards older than 24 hours...");
  console.log("");
  
  const dependencies = getDependencies();
  const cardService = dependencies.getCardService();

  try {
    const deletedCount = await cardService.cleanupTemporaryCards();
    
    console.log("");
    console.log("=".repeat(60));
    if (deletedCount === 0) {
      console.log("✓ SUCCESS: No temporary cards found");
      console.log("  This is the expected behavior - all cards properly confirmed");
    } else {
      console.log(`✓ SUCCESS: Cleaned up ${deletedCount} temporary card(s)`);
      console.log("  These cards were likely from crashed sessions or cancellations");
    }
    console.log("=".repeat(60));
  } catch (error) {
    console.log("");
    console.log("=".repeat(60));
    console.error("✗ ERROR: Cleanup failed");
    console.error(error);
    console.log("=".repeat(60));
    process.exit(1);
  } finally {
    dependencies.close();
  }
}

cleanupTemporaryCards();
