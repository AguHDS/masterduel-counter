/**
 * Clear Monthly Snapshots Script
 * 
 * Deletes all monthly trending snapshots from the database.
 * Useful for cleaning up test data or resetting the trending system.
 * 
 * Usage:
 * - npm run clear-snapshots                (removes all snapshots)
 * - npm run clear-snapshots 2026-05        (removes snapshots for a specific month)
 */

import { getDependencies } from "@/compositionRoot.js";

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
  const targetMonth = process.argv[2];

  // If specific month provided, validate it
  if (targetMonth && !isValidMonthFormat(targetMonth)) {
    console.error("❌ Invalid month format. Use YYYY-MM (e.g., 2026-05)");
    process.exit(1);
  }

  console.log("🗑️  Clearing Monthly Snapshots");
  console.log("━".repeat(50));

  if (targetMonth) {
    console.log(`📅 Target: ${targetMonth} only`);
  } else {
    console.log("📅 Target: ALL months");
  }

  console.log("━".repeat(50));

  try {
    const prisma = getDependencies().getPrismaClient();

    // Count existing snapshots
    const guideCount = await prisma.monthlyGuideRanking.count({
      where: targetMonth ? { month: targetMonth } : undefined,
    });

    const userCount = await prisma.monthlyUserRanking.count({
      where: targetMonth ? { month: targetMonth } : undefined,
    });

    if (guideCount === 0 && userCount === 0) {
      console.log("\n✨ No snapshots found. Database is clean.");
      process.exit(0);
    }

    console.log(`\n📊 Found ${guideCount} guide snapshots`);
    console.log(`📊 Found ${userCount} user snapshots`);

    // Delete snapshots
    console.log("\n🔄 Deleting snapshots...");

    const [deletedGuides, deletedUsers] = await Promise.all([
      prisma.monthlyGuideRanking.deleteMany({
        where: targetMonth ? { month: targetMonth } : undefined,
      }),
      prisma.monthlyUserRanking.deleteMany({
        where: targetMonth ? { month: targetMonth } : undefined,
      }),
    ]);

    console.log("\n" + "━".repeat(50));
    console.log("✅ SNAPSHOTS DELETED SUCCESSFULLY");
    console.log("━".repeat(50));
    console.log(`🗑️  Removed ${deletedGuides.count} guide snapshots`);
    console.log(`🗑️  Removed ${deletedUsers.count} user snapshots`);

    if (!targetMonth) {
      console.log("\n💡 All monthly snapshots have been cleared");
      console.log("🔄 You can run 'npm run simulate-snapshot' to create new ones\n");
    } else {
      console.log(`\n💡 Snapshots for ${targetMonth} have been cleared`);
      console.log(`🔄 Run 'npm run simulate-snapshot ${targetMonth}' to recreate them\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error);
    process.exit(1);
  }
}

main();
