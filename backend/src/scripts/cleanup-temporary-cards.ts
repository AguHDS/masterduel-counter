import { getDependencies } from "../compositionRoot";

async function cleanupTemporaryCards() {
  console.log("Starting cleanup of temporary cards...");
  
  const dependencies = getDependencies();
  const cardService = dependencies.getCardService();

  try {
    const deletedCount = await cardService.cleanupTemporaryCards();
    console.log(`✓ Cleanup completed: ${deletedCount} temporary card(s) deleted`);
  } catch (error) {
    console.error("✗ Error during cleanup:", error);
    process.exit(1);
  } finally {
    dependencies.close();
  }
}

cleanupTemporaryCards();
