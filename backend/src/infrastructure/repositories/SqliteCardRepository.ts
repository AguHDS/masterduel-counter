import { Card } from "@/domain/Card";
import { CardRepository } from "@/domain/ports/CardRepository";
import { DatabaseConnection } from "@/database/database";

export class SqliteCardRepository implements CardRepository {
  constructor(private db: DatabaseConnection) {}

  async findByName(name: string): Promise<Card[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM cards 
      WHERE name LIKE ? 
      ORDER BY is_temporary ASC, created_at DESC
    `);
    
    const rows = stmt.all(`%${name}%`) as unknown[];
    return rows.map(this.mapRowToCard);
  }

  async findById(id: number): Promise<Card | null> {
    const stmt = this.db.prepare("SELECT * FROM cards WHERE id = ?");
    const row = stmt.get(id);
    
    if (!row) {
      return null;
    }
    
    return this.mapRowToCard(row);
  }

  async save(card: Card): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO cards (
        id, name, image_url, image_url_small, 
        cloudinary_public_id, cloudinary_public_id_small, 
        is_temporary, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        image_url = excluded.image_url,
        image_url_small = excluded.image_url_small,
        cloudinary_public_id = excluded.cloudinary_public_id,
        cloudinary_public_id_small = excluded.cloudinary_public_id_small,
        is_temporary = excluded.is_temporary
    `);

    stmt.run(
      card.id,
      card.name,
      card.imageUrl,
      card.imageUrlSmall,
      card.cloudinaryPublicId,
      card.cloudinaryPublicIdSmall,
      card.isTemporary ? 1 : 0,
      card.createdAt
    );
  }

  async existsById(id: number): Promise<boolean> {
    const stmt = this.db.prepare("SELECT 1 FROM cards WHERE id = ?");
    const row = stmt.get(id);
    return !!row;
  }

  async updateToPermament(id: number): Promise<void> {
    const stmt = this.db.prepare("UPDATE cards SET is_temporary = 0 WHERE id = ?");
    stmt.run(id);
  }

  async findTemporaryOlderThan(hours: number): Promise<Card[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM cards 
      WHERE is_temporary = 1 
      AND datetime(created_at) <= datetime('now', '-' || ? || ' hours')
    `);
    
    const rows = stmt.all(hours) as unknown[];
    return rows.map(this.mapRowToCard);
  }

  async deleteById(id: number): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM cards WHERE id = ?");
    stmt.run(id);
  }

  private mapRowToCard(row: unknown): Card {
    const r = row as {
      id: number;
      name: string;
      image_url: string;
      image_url_small: string;
      cloudinary_public_id: string;
      cloudinary_public_id_small: string;
      is_temporary: number;
      created_at: string;
    };
    return {
      id: r.id,
      name: r.name,
      imageUrl: r.image_url,
      imageUrlSmall: r.image_url_small,
      cloudinaryPublicId: r.cloudinary_public_id,
      cloudinaryPublicIdSmall: r.cloudinary_public_id_small,
      isTemporary: r.is_temporary === 1,
      createdAt: r.created_at,
    };
  }
}
