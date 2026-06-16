import { TierListRepository } from "@/domain/ports/TierListRepository.js";
import { TierListEntry } from "@/domain/TierList.js";
import type Database from "better-sqlite3";

export class SqliteTierListRepository implements TierListRepository {
  constructor(private db: Database.Database) {}

  getEntries(format: string): Promise<TierListEntry[]> {
    const stmt = this.db.prepare(
      `SELECT * FROM tier_list_entries WHERE format = ? AND is_active = 1 ORDER BY tier ASC, position ASC`,
    );
    const rows = stmt.all(format) as Array<Record<string, unknown>>;
    return Promise.resolve(rows.map(this.mapRowToEntry));
  }

  saveEntries(format: string, input: { entries: { id?: number; deckName: string; tier: number; position: number; imageUrl: string | null; source: string }[] }): Promise<void> {
    const deleteStmt = this.db.prepare(`DELETE FROM tier_list_entries WHERE format = ?`);
    const insertStmt = this.db.prepare(
      `INSERT INTO tier_list_entries (deck_name, tier, format, position, image_url, source, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
    );

    const transaction = this.db.transaction(() => {
      deleteStmt.run(format);
      for (const entry of input.entries) {
        insertStmt.run(
          entry.deckName,
          entry.tier,
          format,
          entry.position,
          entry.imageUrl ?? null,
          entry.source,
        );
      }
    });

    transaction();
    return Promise.resolve();
  }

  updatePositions(_format: string, positions: { id: number; position: number }[]): Promise<void> {
    const stmt = this.db.prepare(
      `UPDATE tier_list_entries SET position = ?, updated_at = datetime('now') WHERE id = ?`,
    );

    const transaction = this.db.transaction(() => {
      for (const pos of positions) {
        stmt.run(pos.position, pos.id);
      }
    });

    transaction();
    return Promise.resolve();
  }

  getConfig(format: string): Promise<{
    id: number;
    format: string;
    scrapingEnabled: boolean;
    lastScrapedAt: string | null;
    updatedAt: string;
  } | null> {
    const stmt = this.db.prepare(`SELECT * FROM tier_list_config WHERE format = ?`);
    const row = stmt.get(format) as Record<string, unknown> | undefined;
    if (!row) return Promise.resolve(null);
    return Promise.resolve({
      id: row.id as number,
      format: row.format as string,
      scrapingEnabled: (row.scraping_enabled as number) === 1,
      lastScrapedAt: row.last_scraped_at as string | null,
      updatedAt: row.updated_at as string,
    });
  }

  async upsertConfig(format: string, scrapingEnabled: boolean): Promise<{
    id: number;
    format: string;
    scrapingEnabled: boolean;
    lastScrapedAt: string | null;
    updatedAt: string;
  }> {
    const stmt = this.db.prepare(
      `INSERT INTO tier_list_config (format, scraping_enabled, last_scraped_at, updated_at)
       VALUES (?, ?, NULL, datetime('now'))
       ON CONFLICT(format) DO UPDATE SET
         scraping_enabled = excluded.scraping_enabled,
         updated_at = datetime('now')`,
    );
    stmt.run(format, scrapingEnabled ? 1 : 0);
    const config = await this.getConfig(format);
    return config!;
  }

  updateLastScrapedAt(format: string): Promise<void> {
    const stmt = this.db.prepare(
      `UPDATE tier_list_config SET last_scraped_at = datetime('now'), updated_at = datetime('now') WHERE format = ?`,
    );
    stmt.run(format);
    return Promise.resolve();
  }

  replaceScrapedEntries(
    format: string,
    entries: Omit<TierListEntry, "id" | "createdAt" | "updatedAt" | "isActive" | "source" | "scrapedAt">[],
  ): Promise<void> {
    // 1. Get existing manual entries (to preserve their imageUrl)
    const getManualStmt = this.db.prepare(
      `SELECT LOWER(deck_name) as key, deck_name, image_url FROM tier_list_entries WHERE format = ? AND source = 'manual' AND is_active = 1`,
    );
    const manualRows = getManualStmt.all(format) as Array<{ key: string; deck_name: string; image_url: string | null }>;
    const manualMap = new Map<string, string | null>();
    for (const row of manualRows) {
      manualMap.set(row.key, row.image_url);
    }
    console.log(`[TierList] Found ${manualMap.size} manual entries to preserve`);

    // 2. Delete scraped entries
    const deleteScrapedStmt = this.db.prepare(
      `DELETE FROM tier_list_entries WHERE format = ? AND source = 'scraped'`,
    );
    // 3. Update manual entries that match scraped decks (tier follows meta, image preserved)
    const updateManualStmt = this.db.prepare(
      `UPDATE tier_list_entries SET tier = ?, position = ?, scraped_at = datetime('now'), updated_at = datetime('now')
       WHERE format = ? AND LOWER(deck_name) = ? AND source = 'manual'`,
    );
    // 4. Delete manual entries that fell off the meta
    const scrapedNames = new Set(entries.map(e => e.deckName.toLowerCase()));
    const deleteFallenStmt = this.db.prepare(
      `DELETE FROM tier_list_entries WHERE format = ? AND source = 'manual' AND is_active = 1`,
    );
    // 5. Insert new scraped entries
    const insertStmt = this.db.prepare(
      `INSERT INTO tier_list_entries (deck_name, tier, format, position, image_url, source, is_active, scraped_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'scraped', 1, datetime('now'), datetime('now'), datetime('now'))`,
    );

    const transaction = this.db.transaction(() => {
      deleteScrapedStmt.run(format);

      let preservedCount = 0;
      let fallenCount = 0;

      // Update manual entries that still exist in the scrape
      for (const entry of entries) {
        const key = entry.deckName.toLowerCase();
        if (manualMap.has(key)) {
          updateManualStmt.run(entry.tier, entry.position, format, key);
          preservedCount++;
        }
      }

      // Delete manual entries not in this scrape (fell off meta)
      const manualKeys = Array.from(manualMap.keys());
      for (const manualKey of manualKeys) {
        if (!scrapedNames.has(manualKey)) {
          deleteFallenStmt.run(format, manualKey);
          fallenCount++;
        }
      }

      // Insert new scraped entries (including those that were manual — manual entries are UPDATE, not INSERT)
      for (const entry of entries) {
        // Only insert as scraped if NOT already handled as manual
        if (!manualMap.has(entry.deckName.toLowerCase())) {
          insertStmt.run(
            entry.deckName,
            entry.tier,
            format,
            entry.position,
            entry.imageUrl ?? null,
          );
        }
      }

      console.log(`[TierList] Preserved ${preservedCount} manual entries, removed ${fallenCount} fallen entries`);
    });

    transaction();
    return Promise.resolve();
  }

  private mapRowToEntry(row: Record<string, unknown>): TierListEntry {
    return {
      id: row.id as number,
      deckName: row.deck_name as string,
      tier: row.tier as number,
      format: row.format as string,
      position: row.position as number,
      imageUrl: row.image_url as string | null,
      source: (row.source as string) as "scraped" | "manual",
      isActive: (row.is_active as number) === 1,
      scrapedAt: row.scraped_at as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
