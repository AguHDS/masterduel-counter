import { TierListRepository } from "@/domain/ports/TierListRepository.js";
import { TierListEntry } from "@/domain/TierList.js";
import type Database from "better-sqlite3";

export class SqliteTierListRepository implements TierListRepository {
  constructor(private db: Database.Database) {}

  // Returns active entries ordered by tier then position
  getEntries(format: string): Promise<TierListEntry[]> {
    const stmt = this.db.prepare(
      `SELECT * FROM tier_list_entries WHERE format = ? AND is_active = 1 ORDER BY tier ASC, position ASC`,
    );
    const rows = stmt.all(format) as Array<Record<string, unknown>>;
    return Promise.resolve(rows.map(this.mapRowToEntry));
  }

  // Soft-delete: marks removed entries as inactive, upserts current entries preserving linkedArchetype + imageUrl
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
        linkedArchetypeId?: number | null;
        linkedArchetypeName?: string | null;
      }[];
    },
  ): Promise<void> {
    const savedNames = new Set(input.entries.map((e) => e.deckName.toLowerCase()));

    const softDeleteStmt = this.db.prepare(
      `UPDATE tier_list_entries SET is_active = 0, updated_at = datetime('now')
       WHERE format = ? AND is_active = 1 AND LOWER(deck_name) = ?`,
    );
    const upsertStmt = this.db.prepare(
      `INSERT INTO tier_list_entries (id, deck_name, tier, format, position, image_url, source, linked_archetype_id, linked_archetype_name, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         deck_name = excluded.deck_name,
         tier = excluded.tier,
         position = excluded.position,
         image_url = excluded.image_url,
         source = excluded.source,
         linked_archetype_id = excluded.linked_archetype_id,
         linked_archetype_name = excluded.linked_archetype_name,
         is_active = 1,
         updated_at = datetime('now')`,
    );
    const existingStmt = this.db.prepare(
      `SELECT LOWER(deck_name) as key FROM tier_list_entries WHERE format = ? AND is_active = 1`,
    );

    const transaction = this.db.transaction(() => {
      const existingRows = existingStmt.all(format) as Array<{ key: string }>;
      for (const row of existingRows) {
        if (!savedNames.has(row.key)) {
          softDeleteStmt.run(format, row.key);
        }
      }

      for (const entry of input.entries) {
        upsertStmt.run(
          entry.id ?? null,
          entry.deckName,
          entry.tier,
          format,
          entry.position,
          entry.imageUrl ?? null,
          entry.source,
          entry.linkedArchetypeId ?? null,
          entry.linkedArchetypeName ?? null,
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

  // Scraper merge: updates scraped+linked entries, skips manual-only, auto-resets inactive entries
  replaceScrapedEntries(
    format: string,
    entries: Omit<TierListEntry, "id" | "createdAt" | "updatedAt" | "isActive" | "source" | "scrapedAt">[],
  ): Promise<void> {
    const scrapedNames = new Set(entries.map((e) => e.deckName.toLowerCase()));

    const existingStmt = this.db.prepare(
      `SELECT id, LOWER(deck_name) as key, source, is_active, linked_archetype_id FROM tier_list_entries WHERE format = ?`,
    );
    const existingRows = existingStmt.all(format) as Array<{
      id: number; key: string; source: string; is_active: number; linked_archetype_id: number | null;
    }>;
    const existingMap = new Map<string, { id: number; source: string; isActive: boolean; hasLink: boolean }>();
    for (const row of existingRows) {
      existingMap.set(row.key, { id: row.id, source: row.source, isActive: row.is_active === 1, hasLink: row.linked_archetype_id !== null });
    }

    const updateStmt = this.db.prepare(
      `UPDATE tier_list_entries SET tier = ?, position = ?, scraped_at = datetime('now'), updated_at = datetime('now')
       WHERE format = ? AND LOWER(deck_name) = ?`,
    );
    const insertStmt = this.db.prepare(
      `INSERT INTO tier_list_entries (deck_name, tier, format, position, image_url, source, is_active, scraped_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'scraped', 1, datetime('now'), datetime('now'), datetime('now'))`,
    );
    const deleteFallenStmt = this.db.prepare(
      `DELETE FROM tier_list_entries WHERE format = ? AND is_active = 1 AND LOWER(deck_name) = ?`,
    );
    const reactivateStmt = this.db.prepare(
      `UPDATE tier_list_entries SET is_active = 1, updated_at = datetime('now')
       WHERE format = ? AND is_active = 0 AND LOWER(deck_name) = ?`,
    );

    const transaction = this.db.transaction(() => {
      let updatedCount = 0, insertedCount = 0, skippedManual = 0, skippedInactive = 0, fallenCount = 0, reactivatedCount = 0;

      for (const entry of entries) {
        const key = entry.deckName.toLowerCase();
        const existing = existingMap.get(key);

        if (existing) {
          if (!existing.isActive) {
            skippedInactive++;
          } else if (existing.source === "manual" && !existing.hasLink) {
            skippedManual++;
          } else {
            updateStmt.run(entry.tier, entry.position, format, key);
            updatedCount++;
          }
        } else {
          const inactive = this.db.prepare(
            `SELECT id FROM tier_list_entries WHERE format = ? AND is_active = 0 AND LOWER(deck_name) = ?`,
          ).get(format, key);
          if (inactive) {
            skippedInactive++;
          } else {
            insertStmt.run(entry.deckName, entry.tier, format, entry.position, entry.imageUrl ?? null);
            insertedCount++;
          }
        }
      }

      for (const [key, existing] of existingMap) {
        if (!scrapedNames.has(key)) {
          if (!existing.isActive) {
            reactivateStmt.run(format, key);
            reactivatedCount++;
          } else {
            deleteFallenStmt.run(format, key);
            fallenCount++;
          }
        }
      }

      console.log(
        `[TierList] Scrape merge: ${updatedCount} updated, ${insertedCount} inserted, ${skippedManual} manual skipped, ${skippedInactive} inactive skipped, ${fallenCount} removed, ${reactivatedCount} reactivated`,
      );
    });

    transaction();
    return Promise.resolve();
  }

  /** Get quanity of guides counter and deck */
  async enrichWithGuideCounts(entries: TierListEntry[]): Promise<void> {
    const archetypeIds = new Set<number>();
    const nameToId = new Map<string, number>();

    // Collect archetype IDs from linked entries
    for (const entry of entries) {
      if (entry.linkedArchetypeId) {
        archetypeIds.add(entry.linkedArchetypeId);
      }
    }

    // Try matching non-linked entries by deckName
    const nonLinkedNames = entries.filter((e) => !e.linkedArchetypeId).map((e) => e.deckName.toLowerCase());
    if (nonLinkedNames.length > 0) {
      const placeholders = nonLinkedNames.map(() => "?").join(",");
      const stmt = this.db.prepare(
        `SELECT id, LOWER(name) as key FROM archetypes WHERE LOWER(name) IN (${placeholders})`,
      );
      const rows = stmt.all(...nonLinkedNames) as Array<{ id: number; key: string }>;
      for (const row of rows) {
        nameToId.set(row.key, row.id);
        archetypeIds.add(row.id);
      }
    }

    if (archetypeIds.size === 0) return;

    // Batch query guide counts
    const idList = Array.from(archetypeIds);
    const placeholders = idList.map(() => "?").join(",");
    const stmt = this.db.prepare(
      `SELECT archetype_id, guide_type, COUNT(*) as count
       FROM archetype_instances
       WHERE archetype_id IN (${placeholders}) AND is_draft = 0
       GROUP BY archetype_id, guide_type`,
    );
    const rows = stmt.all(...idList) as Array<{ archetype_id: number; guide_type: string; count: number }>;

    const countMap = new Map<string, number>();
    for (const row of rows) {
      countMap.set(`${row.archetype_id}_${row.guide_type}`, row.count);
    }

    for (const entry of entries) {
      const archetypeId = entry.linkedArchetypeId ?? nameToId.get(entry.deckName.toLowerCase());
      if (archetypeId) {
        entry.counterGuideCount = countMap.get(`${archetypeId}_COUNTER`) ?? 0;
        entry.deckGuideCount = countMap.get(`${archetypeId}_DECK`) ?? 0;
      }
    }
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
      linkedArchetypeId: row.linked_archetype_id as number | null,
      linkedArchetypeName: row.linked_archetype_name as string | null,
      counterGuideCount: 0,
      deckGuideCount: 0,
      scrapedAt: row.scraped_at as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
