import Database from "better-sqlite3";
import {
  InitialHand,
  InitialHandWithCards,
  InitialHandCreateDTO,
} from "@/domain/InitialHand.js";
import { InitialHandRepository } from "@/domain/ports/InitialHandRepository.js";

export class SqliteInitialHandRepository implements InitialHandRepository {
  constructor(private db: Database.Database) {}

  async createInitialHand(data: InitialHandCreateDTO): Promise<InitialHand> {
    const stmt = this.db.prepare(`
      INSERT INTO initial_hands (instance_id, card_ids, position)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      data.instanceId,
      JSON.stringify(data.cardIds),
      data.position,
    );

    const selectStmt = this.db.prepare(`
      SELECT * FROM initial_hands WHERE id = ?
    `);

    interface InitialHandRow {
      id: number;
      instance_id: number;
      card_ids: string;
      position: number;
      created_at: string;
    }

    const row = selectStmt.get(result.lastInsertRowid) as InitialHandRow;

    return {
      id: row.id,
      instanceId: row.instance_id,
      cardIds: JSON.parse(row.card_ids),
      position: row.position,
      createdAt: new Date(row.created_at),
    };
  }

  async createManyInitialHands(
    instanceId: number,
    initialHands: Array<{ cardIds: number[] }>,
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO initial_hands (instance_id, card_ids, position)
      VALUES (?, ?, ?)
    `);

    initialHands.forEach((hand, index) => {
      stmt.run(
        instanceId,
        JSON.stringify(hand.cardIds),
        index,
      );
    });
  }

  async findInitialHandsByInstanceId(
    instanceId: number,
  ): Promise<InitialHandWithCards[]> {
    const stmt = this.db.prepare(`
      SELECT 
        ih.id,
        ih.instance_id,
        ih.card_ids,
        ih.position,
        ih.created_at
      FROM initial_hands ih
      WHERE ih.instance_id = ?
      ORDER BY ih.position ASC
    `);

    interface InitialHandRow {
      id: number;
      instance_id: number;
      card_ids: string;
      position: number;
      created_at: string;
    }

    const rows = stmt.all(instanceId) as InitialHandRow[];

    // Fetch card details for all hands
    const results: InitialHandWithCards[] = [];

    for (const row of rows) {
      const cardIds = JSON.parse(row.card_ids) as number[];
      
      if (cardIds.length === 0) {
        results.push({
          id: row.id,
          instanceId: row.instance_id,
          cards: [],
          position: row.position,
          createdAt: new Date(row.created_at),
        });
        continue;
      }

      // Fetch cards for this initial hand
      const placeholders = cardIds.map(() => "?").join(",");
      const cardStmt = this.db.prepare(`
        SELECT id, name, image_url, image_url_small, image_url_cropped
        FROM cards
        WHERE id IN (${placeholders})
      `);

      interface CardRow {
        id: number;
        name: string;
        image_url: string;
        image_url_small: string;
        image_url_cropped: string;
      }

      const cardRows = cardStmt.all(...cardIds) as CardRow[];

      // Preserve order of cardIds
      const orderedCards = cardIds
        .map((id) => cardRows.find((card) => card.id === id))
        .filter((card): card is CardRow => card !== undefined)
        .map((card) => ({
          id: card.id,
          name: card.name,
          imageUrl: card.image_url,
          imageUrlSmall: card.image_url_small,
          imageUrlCropped: card.image_url_cropped,
        }));

      results.push({
        id: row.id,
        instanceId: row.instance_id,
        cards: orderedCards,
        position: row.position,
        createdAt: new Date(row.created_at),
      });
    }

    return results;
  }

  async deleteInitialHandsByInstanceId(instanceId: number): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM initial_hands
      WHERE instance_id = ?
    `);

    stmt.run(instanceId);
  }
}
