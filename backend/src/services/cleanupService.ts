import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import config from "@/infrastructure/config/environmentVars.js";

const prisma = new PrismaClient();

/**
 * Service to clean up unverified user accounts
 * 
 * Periodically removes users who:
 * - Have emailVerified = false
 * - Were created more than UNVERIFIED_ACCOUNT_TTL_HOURS hours ago
 * - Only have credential-based accounts (not OAuth users)
 * 
 * This prevents email squatting where someone registers with an email
 * they don't own, blocking the real owner from signing up.
 */

interface CleanupConfig {
  unverifiedAccountTTLHours: number;
  cronSchedule: string;
  enabled: boolean;
}

const DEFAULT_CONFIG: CleanupConfig = {
  unverifiedAccountTTLHours: 24,
  cronSchedule: "0 3 * * *", // Every day at 3 AM
  enabled: true,
};

/**
 * Deletes unverified user accounts older than the TTL
 * @returns Number of deleted users
 */
export async function cleanupUnverifiedAccounts(): Promise<number> {
  const ttlHours = config.unverifiedAccountTTLHours ?? DEFAULT_CONFIG.unverifiedAccountTTLHours;
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - ttlHours);

  try {
    console.log(`\n[Cleanup Service] Starting cleanup of unverified accounts...`);
    console.log(`[Cleanup Service] Cutoff date: ${cutoffDate.toISOString()} (${ttlHours}h ago)`);

    // Find users who:
    // 1. Have NOT verified their email
    // 2. Were created before the cutoff date
    // 3. Only have credential-based accounts (OAuth users should keep their accounts even if unverified)
    const usersToDelete = await prisma.user.findMany({
      where: {
        emailVerified: false,
        createdAt: {
          lt: cutoffDate,
        },
        accounts: {
          every: {
            providerId: "credential",
          },
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (usersToDelete.length === 0) {
      console.log(`[Cleanup Service] No unverified accounts to clean up.`);
      return 0;
    }

    console.log(`[Cleanup Service] Found ${usersToDelete.length} unverified account(s) to delete:`);
    usersToDelete.forEach((user) => {
      console.log(`  - ${user.email} (created: ${user.createdAt.toISOString()})`);
    });

    // Delete users (cascade will handle related records: sessions, accounts, etc.)
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: {
          in: usersToDelete.map((u) => u.id),
        },
      },
    });

    console.log(`[Cleanup Service] Successfully deleted ${deleteResult.count} unverified account(s).`);
    return deleteResult.count;
  } catch (error) {
    console.error(`[Cleanup Service] Error during cleanup:`, error);
    // Don't throw - we don't want to crash the app if cleanup fails
    return 0;
  }
}

/**
 * Starts the periodic cleanup job
 */
export function startCleanupJob(): void {
  const cleanupConfig: CleanupConfig = {
    enabled: config.cleanupUnverifiedAccountsEnabled ?? DEFAULT_CONFIG.enabled,
    cronSchedule: config.cleanupCronSchedule ?? DEFAULT_CONFIG.cronSchedule,
    unverifiedAccountTTLHours: config.unverifiedAccountTTLHours ?? DEFAULT_CONFIG.unverifiedAccountTTLHours,
  };

  if (!cleanupConfig.enabled) {
    console.log(`[Cleanup Service] Unverified account cleanup is DISABLED.`);
    return;
  }

  console.log(`[Cleanup Service] Starting cleanup job...`);
  console.log(`[Cleanup Service] Schedule: ${cleanupConfig.cronSchedule}`);
  console.log(`[Cleanup Service] TTL: ${cleanupConfig.unverifiedAccountTTLHours} hours`);

  // Validate cron expression
  if (!cron.validate(cleanupConfig.cronSchedule)) {
    console.error(`[Cleanup Service] Invalid cron schedule: ${cleanupConfig.cronSchedule}`);
    return;
  }

  // Schedule the cleanup job
  cron.schedule(cleanupConfig.cronSchedule, async () => {
    console.log(`\n[Cleanup Service] Cron job triggered at ${new Date().toISOString()}`);
    await cleanupUnverifiedAccounts();
  });

  console.log(`[Cleanup Service] Cleanup job scheduled successfully.`);

  // Run cleanup once on startup (good for testing)
  if (config.nodeEnv === "development") {
    console.log(`[Cleanup Service] Running initial cleanup (development mode)...`);
    setTimeout(() => {
      cleanupUnverifiedAccounts();
    }, 5000); // Wait 5 seconds after startup
  }
}