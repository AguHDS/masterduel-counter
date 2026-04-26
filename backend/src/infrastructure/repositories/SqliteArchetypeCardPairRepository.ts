import { GuideCardPairRepository } from "@/domain/ports/GuideCardPairRepository.js";
import {
  CardPair,
  GuideCardPairCreateDTO,
  GuideCardPairWithDetails,
} from "@/domain/CardPair.js";
import Database from "better-sqlite3";

export class SqliteArchetypeCardPairRepository implements GuideCardPairRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async CreateManyPairCards(
    pairs: GuideCardPairCreateDTO[],
  ): Promise<CardPair[]> {
    const pairStmt = this.db.prepare(`
      INSERT INTO archetype_card_pairs (instance_id, pair_order, pair_section, comment)
      VALUES (?, ?, ?, ?)
      RETURNING id, instance_id, pair_order, pair_section, comment, created_at
    `);

    const topStmt = this.db.prepare(`
      INSERT INTO card_pair_top (pair_id, card_id, position)
      VALUES (?, ?, ?)
    `);

    const bottomStmt = this.db.prepare(`
      INSERT INTO card_pair_bottom (pair_id, card_id, position, effectiveness)
      VALUES (?, ?, ?, ?)
    `);

    const results: CardPair[] = [];

    for (const pair of pairs) {
      // Create the pair
      const result = pairStmt.get(
        pair.instance_id,
        pair.pair_order,
        pair.pair_section || null,
        pair.comment || null,
      ) as Omit<CardPair, "top_card_ids" | "bottom_card_ids">;

      pair.top_card_ids.forEach((cardId, index) => {
        topStmt.run(result.id, cardId, index);
      });

      pair.bottom_card_ids.forEach((bottomCard, index) => {
        bottomStmt.run(result.id, bottomCard.cardId, index, bottomCard.effectiveness || null);
      });

      results.push({
        ...result,
        top_card_ids: pair.top_card_ids,
        bottom_card_ids: pair.bottom_card_ids,
      });
    }

    return results;
  }

  async findCardPairsByGuideId(
    instanceId: number,
  ): Promise<GuideCardPairWithDetails[]> {
    const pairStmt = this.db.prepare(`
      SELECT id, instance_id, pair_order, pair_section, comment, created_at
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
      SELECT c.id, c.name, c.image_url, c.image_url_small, c.image_url_cropped, cpb.effectiveness
      FROM card_pair_bottom cpb
      INNER JOIN cards c ON cpb.card_id = c.id
      WHERE cpb.pair_id = ?
      ORDER BY cpb.position
    `);

    const pairs = pairStmt.all(instanceId) as Omit<
      GuideCardPairWithDetails,
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
        effectiveness?: string | null;
      }>,
    }));
  }

  async deleteCardPairsByGuideId(instanceId: number): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM archetype_card_pairs
      WHERE instance_id = ?
    `);

    stmt.run(instanceId);
  }
}
