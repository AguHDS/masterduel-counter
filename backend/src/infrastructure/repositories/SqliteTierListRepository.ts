import { TierListRepository } from "@/domain/ports/TierListRepository.js";
import { TierListEntry } from "@/domain/TierList.js";
import type Database from "better-sqlite3";

export class SqliteTierListRepository implements TierListRepository {
  constructor(private db: Database.Database) {}

  /** Returns active entries ordered by tier then position */
  getEntries(format: string): Promise<TierListEntry[]> {
    const stmt = this.db.prepare(
      `SELECT * FROM tier_list_entries WHERE format = ? AND is_active = 1 ORDER BY tier ASC, position ASC`,
    );
    const rows = stmt.all(format) as Array<Record<string, unknown>>;
    return Promise.resolve(rows.map(this.mapRowToEntry));
  }

  /** Full replacement: DELETE all entries for format, then INSERT provided entries (admin save) */
  saveEntries(
    format: string,
    input: {
      entries: {
        id?: number;
        deckName: string;
        tier: number;
        position: number;
        imageUrl: string | null;
        source: string;
      }[];
    },
  ): Promise<void> {
    const deleteStmt = this.db.prepare(
      `DELETE FROM tier_list_entries WHERE format = ?`,
    );
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

  updatePositions(
    _format: string,
    positions: { id: number; position: number }[],
  ): Promise<void> {
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
    const stmt = this.db.prepare(
      `SELECT * FROM tier_list_config WHERE format = ?`,
    );
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

  async upsertConfig(
    format: string,
    scrapingEnabled: boolean,
  ): Promise<{
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

  // Scraper merge: updates scraped entries, skips manual entries, deletes fallen entries (both types)
  replaceScrapedEntries(
    format: string,
    entries: Omit<
      TierListEntry,
      "id" | "createdAt" | "updatedAt" | "isActive" | "source" | "scrapedAt"
    >[],
  ): Promise<void> {
    const scrapedNames = new Set(entries.map((e) => e.deckName.toLowerCase()));

    const existingStmt = this.db.prepare(
      `SELECT id, LOWER(deck_name) as key, source FROM tier_list_entries WHERE format = ? AND is_active = 1`,
    );
    const existingRows = existingStmt.all(format) as Array<{
      id: number;
      key: string;
      source: string;
    }>;
    const existingMap = new Map<string, { id: number; source: string }>();
    for (const row of existingRows) {
      existingMap.set(row.key, { id: row.id, source: row.source });
    }

    const updateScrapedStmt = this.db.prepare(
      `UPDATE tier_list_entries SET tier = ?, position = ?, scraped_at = datetime('now'), updated_at = datetime('now')
       WHERE format = ? AND LOWER(deck_name) = ? AND source = 'scraped'`,
    );
    const insertStmt = this.db.prepare(
      `INSERT INTO tier_list_entries (deck_name, tier, format, position, image_url, source, is_active, scraped_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'scraped', 1, datetime('now'), datetime('now'), datetime('now'))`,
    );
    const deleteFallenStmt = this.db.prepare(
      `DELETE FROM tier_list_entries WHERE format = ? AND is_active = 1 AND LOWER(deck_name) = ?`,
    );

    const transaction = this.db.transaction(() => {
      let updatedCount = 0;
      let insertedCount = 0;
      let skippedManual = 0;

      for (const entry of entries) {
        const key = entry.deckName.toLowerCase();
        const existing = existingMap.get(key);

        if (existing) {
          if (existing.source === "manual") {
            skippedManual++;
          } else {
            updateScrapedStmt.run(entry.tier, entry.position, format, key);
            updatedCount++;
          }
        } else {
          insertStmt.run(
            entry.deckName,
            entry.tier,
            format,
            entry.position,
            entry.imageUrl ?? null,
          );
          insertedCount++;
        }
      }

      let fallenCount = 0;
      for (const [key] of existingMap) {
        if (!scrapedNames.has(key)) {
          deleteFallenStmt.run(format, key);
          fallenCount++;
        }
      }
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
      source: row.source as string as "scraped" | "manual",
      isActive: (row.is_active as number) === 1,
      scrapedAt: row.scraped_at as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
