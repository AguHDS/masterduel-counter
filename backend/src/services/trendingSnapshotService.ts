import cron from "node-cron";
import { getDependencies } from "@/compositionRoot.js";

/**
 * Trending Snapshot Service
 * 
 * Runs a cron job on the 1st of each month at 00:00 (midnight)
 * to snapshot the previous month's top 50 trending guides and users.
 * 
 * The snapshots are saved to MonthlyGuideRanking and MonthlyUserRanking tables
 * for historical trending data and future badge features.
 */

let cronJob: cron.ScheduledTask | null = null;

/**
 * Get the previous month in YYYY-MM format
 */
function getPreviousMonth(): string {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return previousMonth.toISOString().slice(0, 7);
}

/**
 * Execute the trending snapshot for the previous month
 */
async function executeTrendingSnapshot(): Promise<void> {
  const previousMonth = getPreviousMonth();
  console.log(
    `[TrendingSnapshot] Starting monthly snapshot for ${previousMonth}...`,
  );

  try {
    const rankingRepository = getDependencies().getRankingRepository();
    await rankingRepository.saveTrendingSnapshot(previousMonth);
    console.log(
      `[TrendingSnapshot] Successfully saved snapshot for ${previousMonth}`,
    );
  } catch (error) {
    console.error(
      `[TrendingSnapshot] Error saving snapshot for ${previousMonth}:`,
      error,
    );
  }
}

/**
 * Start the monthly trending snapshot cron job
 * Runs at 00:00 on the 1st day of every month
 */
export function startTrendingSnapshotService(): void {
  if (cronJob) {
    console.warn(
      "[TrendingSnapshot] Service already running, skipping initialization",
    );
    return;
  }

  // Schedule: "0 0 1 * *" means:
  // - minute 0
  // - hour 0
  // - day 1
  // - any month
  // - any day of week
  cronJob = cron.schedule(
    "0 0 1 * *",
    async () => {
      await executeTrendingSnapshot();
    },
    {
      timezone: "UTC", // Use UTC to avoid timezone issues
    },
  );

  console.log(
    "[TrendingSnapshot] Cron job scheduled: Runs at 00:00 UTC on the 1st of each month",
  );
}

/**
 * Stop the trending snapshot cron job
 * (useful for graceful shutdown)
 */
export function stopTrendingSnapshotService(): void {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log("[TrendingSnapshot] Cron job stopped");
  }
}

/**
 * Manually trigger a snapshot for the previous month
 * (useful for testing or manual runs)
 */
export async function manualTrendingSnapshot(): Promise<void> {
  console.log("[TrendingSnapshot] Manual snapshot triggered");
  await executeTrendingSnapshot();
}
