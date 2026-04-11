import { Card } from "@/domain/Card.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";
import { DatabaseConnection } from "@/database/database.js";

export class SqliteCardRepository implements CardRepository {
  constructor(private db: DatabaseConnection) {}


  async finCardById(id: number): Promise<Card | null> {
    const stmt = this.db.prepare("SELECT * FROM cards WHERE id = ?");
    const row = stmt.get(id);
    
    if (!row) {
      return null;
    }
    
    return this.mapRowToCard(row);
  }

  async saveOrUpdateCard(card: Card): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO cards (
        id, name, image_url, image_url_small, image_url_cropped, frame_type, level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        image_url = excluded.image_url,
        image_url_small = excluded.image_url_small,
        image_url_cropped = excluded.image_url_cropped,
        frame_type = excluded.frame_type,
        level = excluded.level
    `);

    stmt.run(
      card.id,
      card.name,
      card.imageUrl,
      card.imageUrlSmall,
      card.imageUrlCropped,
      card.frameType ?? null,
      card.level ?? null,
      card.createdAt
    );
  }

  // Delete card from database
  async deleteCardById(id: number): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM cards WHERE id = ?");
    stmt.run(id);
  }

  // Get all cards from database
  async getAllCards(): Promise<Card[]> {
    const stmt = this.db.prepare("SELECT * FROM cards");
    const rows = stmt.all() as unknown[];
    return rows.map(this.mapRowToCard);
  }

  private mapRowToCard(row: unknown): Card {
    const r = row as {
      id: number;
      name: string;
      image_url: string;
      image_url_small: string;
      image_url_cropped: string;
      frame_type: string | null;
      level: number | null;
      created_at: string;
    };
    return {
      id: r.id,
      name: r.name,
      imageUrl: r.image_url,
      imageUrlSmall: r.image_url_small,
      imageUrlCropped: r.image_url_cropped,
      frameType: r.frame_type ?? undefined,
      level: r.level ?? undefined,
      createdAt: r.created_at,
    };
  }
}
