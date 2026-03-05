import { ArchetypeCardPairRepository } from "@/domain/ports/ArchetypeCardPairRepository.js";
import {
  ArchetypeCardPair,
  ArchetypeCardPairCreateDTO,
  ArchetypeCardPairWithDetails,
} from "@/domain/ArchetypeCardPair.js";
import Database from "better-sqlite3";

export class SqliteArchetypeCardPairRepository implements ArchetypeCardPairRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async CreateManyPairCards(
    pairs: ArchetypeCardPairCreateDTO[],
  ): Promise<ArchetypeCardPair[]> {
    const pairStmt = this.db.prepare(`
      INSERT INTO archetype_card_pairs (instance_id, pair_order, effectiveness, comment)
      VALUES (?, ?, ?, ?)
      RETURNING id, instance_id, pair_order, effectiveness, comment, created_at
    `);

    const topStmt = this.db.prepare(`
      INSERT INTO card_pair_top (pair_id, card_id, position)
      VALUES (?, ?, ?)
    `);

    const bottomStmt = this.db.prepare(`
      INSERT INTO card_pair_bottom (pair_id, card_id, position)
      VALUES (?, ?, ?)
    `);

    const results: ArchetypeCardPair[] = [];

    for (const pair of pairs) {
      // Create the pair
      const result = pairStmt.get(
        pair.instance_id,
        pair.pair_order,
        pair.effectiveness || null,
        pair.comment || null,
      ) as Omit<ArchetypeCardPair, "top_card_ids" | "bottom_card_ids">;

      pair.top_card_ids.forEach((cardId, index) => {
        topStmt.run(result.id, cardId, index);
      });

      pair.bottom_card_ids.forEach((cardId, index) => {
        bottomStmt.run(result.id, cardId, index);
      });

      results.push({
        ...result,
        top_card_ids: pair.top_card_ids,
        bottom_card_ids: pair.bottom_card_ids,
      });
    }

    return results;
  }

  async findByInstanceIdWithDetails(
    instanceId: number,
  ): Promise<ArchetypeCardPairWithDetails[]> {
    const pairStmt = this.db.prepare(`
      SELECT id, instance_id, pair_order, effectiveness, comment, created_at
      FROM archetype_card_pairs
      WHERE instance_id = ?
      ORDER BY pair_order
    `);

    const topStmt = this.db.prepare(`
      SELECT c.id, c.name, c.image_url, c.image_url_small, c.image_url_cropped
      FROM card_pair_top cpt
      INNER JOIN cards c ON cpt.card_id = c.id
      WHERE cpt.pair_id = ?
      ORDER BY cpt.position
    `);

    const bottomStmt = this.db.prepare(`
      SELECT c.id, c.name, c.image_url, c.image_url_small, c.image_url_cropped
      FROM card_pair_bottom cpb
      INNER JOIN cards c ON cpb.card_id = c.id
      WHERE cpb.pair_id = ?
      ORDER BY cpb.position
    `);

    const pairs = pairStmt.all(instanceId) as Omit<
      ArchetypeCardPairWithDetails,
      "top_cards" | "bottom_cards"
    >[];

    return pairs.map((pair) => ({
      ...pair,
      top_cards: topStmt.all(pair.id) as Array<{
        id: number;
        name: string;
        image_url: string;
        image_url_small: string;
        image_url_cropped: string;
      }>,
      bottom_cards: bottomStmt.all(pair.id) as Array<{
        id: number;
        name: string;
        image_url: string;
        image_url_small: string;
        image_url_cropped: string;
      }>,
    }));
  }

  async deleteByInstanceId(instanceId: number): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM archetype_card_pairs
      WHERE instance_id = ?
    `);

    stmt.run(instanceId);
  }
}
