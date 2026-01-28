import { ArchetypeCardPairRepository } from "@/domain/ports/ArchetypeCardPairRepository";
import {
  ArchetypeCardPair,
  ArchetypeCardPairCreateDTO,
  ArchetypeCardPairWithDetails,
} from "@/domain/ArchetypeCardPair";
import Database from "better-sqlite3";

export class SqliteArchetypeCardPairRepository
  implements ArchetypeCardPairRepository
{
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async createMany(
    pairs: ArchetypeCardPairCreateDTO[],
  ): Promise<ArchetypeCardPair[]> {
    const stmt = this.db.prepare(`
      INSERT INTO archetype_card_pairs (instance_id, top_card_id, bottom_card_id, pair_order, effectiveness, comment)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING id, instance_id, top_card_id, bottom_card_id, pair_order, effectiveness, comment, created_at
    `);

    const results: ArchetypeCardPair[]= [];

    for (const pair of pairs) {
      const result = stmt.get(
        pair.instance_id,
        pair.top_card_id,
        pair.bottom_card_id,
        pair.pair_order,
        pair.effectiveness || null,
        pair.comment || null,
      ) as ArchetypeCardPair;
      results.push(result);
    }

    return results;
  }

  async findByInstanceId(instanceId: number): Promise<ArchetypeCardPair[]> {
    const stmt = this.db.prepare(`
      SELECT id, instance_id, top_card_id, bottom_card_id, pair_order, effectiveness, comment, created_at
      FROM archetype_card_pairs
      WHERE instance_id = ?
      ORDER BY pair_order
    `);

    return stmt.all(instanceId) as ArchetypeCardPair[];
  }

  async findByInstanceIdWithDetails(
    instanceId: number,
  ): Promise<ArchetypeCardPairWithDetails[]> {
    const stmt = this.db.prepare(`
      SELECT 
        acp.id,
        acp.instance_id,
        acp.top_card_id,
        acp.bottom_card_id,
        acp.pair_order,
        acp.effectiveness,
        acp.comment,
        acp.created_at,
        tc.name as top_card_name,
        tc.image_url as top_card_image_url,
        tc.image_url_small as top_card_image_url_small,
        bc.name as bottom_card_name,
        bc.image_url as bottom_card_image_url,
        bc.image_url_small as bottom_card_image_url_small
      FROM archetype_card_pairs acp
      INNER JOIN cards tc ON acp.top_card_id = tc.id
      INNER JOIN cards bc ON acp.bottom_card_id = bc.id
      WHERE acp.instance_id = ?
      ORDER BY acp.pair_order
    `);

    return stmt.all(instanceId) as ArchetypeCardPairWithDetails[];
  }

  async deleteByInstanceId(instanceId: number): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM archetype_card_pairs
      WHERE instance_id = ?
    `);

    stmt.run(instanceId);
  }

  async deleteById(id: number): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM archetype_card_pairs
      WHERE id = ?
    `);

    stmt.run(id);
  }
}
