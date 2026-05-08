/**
 * Simulate Monthly Snapshot Script
 * 
 * Manually triggers the monthly trending snapshot process for testing purposes.
 * This allows testing the snapshot functionality without waiting until the 1st of the month.
 * Only run months that have already passed, not the actual month
 * 
 * Usage:
 * - npm run simulate-snapshot              (snapshots the previous month)
 * - npm run simulate-snapshot 2026-05      (snapshots a specific month)
 */

import { getDependencies } from "@/compositionRoot.js";

/**
 * Get the previous month in YYYY-MM format
 */
function getPreviousMonth(): string {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return previousMonth.toISOString().slice(0, 7);
}

/**
 * Validate month format (YYYY-MM)
 */
function isValidMonthFormat(month: string): boolean {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(month)) return false;

  const [year, monthNum] = month.split("-").map(Number);
  return (
    year >= 2020 &&
    year <= 2100 &&
    monthNum >= 1 &&
    monthNum <= 12
  );
}

async function main(): Promise<void> {
  // Get month from command line argument or use previous month
  const targetMonth = process.argv[2] || getPreviousMonth();

  // Validate format
  if (!isValidMonthFormat(targetMonth)) {
    console.error("❌ Invalid month format. Use YYYY-MM (e.g., 2026-05)");
    process.exit(1);
  }

  console.log("🔄 Simulating Monthly Snapshot");
  console.log("━".repeat(50));
  console.log(`📅 Target Month: ${targetMonth}`);
  console.log("━".repeat(50));

  try {
    const rankingRepository = getDependencies().getRankingRepository();

    // Fetch trending data for the target month
    console.log(`\n🔍 Fetching trending data for ${targetMonth}...`);

    const guideRanking = await rankingRepository.getTrendingGuideRanking(
      targetMonth,
      1,
      15, // Top 15
    );

    const userRanking = await rankingRepository.getTrendingUserRanking(
      targetMonth,
      1,
      10, // Top 10
    );

    console.log(`✅ Found ${guideRanking.total} guides with activity`);
    console.log(`✅ Found ${userRanking.total} users with activity`);

    if (guideRanking.total === 0 && userRanking.total === 0) {
      console.log("\n⚠️  No trending activity found for this month");
      console.log("💡 Tip: Create some guides, add likes, views, or favorites to generate activity");
      process.exit(0);
    }

    // Save the snapshot
    console.log(`\n💾 Saving snapshot for ${targetMonth}...`);
    await rankingRepository.saveTrendingSnapshot(targetMonth);

    console.log("\n" + "━".repeat(50));
    console.log("✅ SNAPSHOT SAVED SUCCESSFULLY");
    console.log("━".repeat(50));

    // Display summary
    if (guideRanking.ranking.length > 0) {
      console.log("\n📊 Top 5 Guides:");
      guideRanking.ranking.slice(0, 5).forEach((guide) => {
        console.log(
          `   ${guide.rank}. ${guide.title} by ${guide.authorName}`,
        );
        console.log(
          `      👍 ${guide.likes} likes · 👁️  ${guide.views ?? 0} views · ⭐ ${guide.favorites ?? 0} favorites`,
        );
      });
    }

    if (userRanking.ranking.length > 0) {
      console.log("\n👥 Top 5 Users:");
      userRanking.ranking.slice(0, 5).forEach((user) => {
        console.log(`   ${user.rank}. ${user.username}`);
        console.log(
          `      👍 ${user.totalLikes} likes · 👁️  ${user.totalViews} views · 📚 ${user.fulfilledRequests} requests`,
        );
      });
    }

    console.log("\n💡 You can now view this data in the Trending section of the app");
    console.log("🗑️  Run 'npm run clear-snapshots' to remove all snapshots\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error);
    process.exit(1);
  }
}

main();
