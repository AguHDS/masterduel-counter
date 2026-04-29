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
        id, name, type, desc, race, attribute, atk, def, level, scale, linkval, linkmarkers, archetype,
        image_url, image_url_small, image_url_cropped, frame_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        type = excluded.type,
        desc = excluded.desc,
        race = excluded.race,
        attribute = excluded.attribute,
        atk = excluded.atk,
        def = excluded.def,
        level = excluded.level,
        scale = excluded.scale,
        linkval = excluded.linkval,
        linkmarkers = excluded.linkmarkers,
        archetype = excluded.archetype,
        image_url = excluded.image_url,
        image_url_small = excluded.image_url_small,
        image_url_cropped = excluded.image_url_cropped,
        frame_type = excluded.frame_type
    `);

    stmt.run(
      card.id,
      card.name,
      card.type,
      card.desc,
      card.race,
      card.attribute ?? null,
      card.atk ?? null,
      card.def ?? null,
      card.level ?? null,
      card.scale ?? null,
      card.linkval ?? null,
      card.linkmarkers ?? null,
      card.archetype ?? null,
      card.imageUrl,
      card.imageUrlSmall,
      card.imageUrlCropped,
      card.frameType ?? null,
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
      type: string;
      desc: string;
      race: string;
      attribute: string | null;
      atk: number | null;
      def: number | null;
      level: number | null;
      scale: number | null;
      linkval: number | null;
      linkmarkers: string | null;
      archetype: string | null;
      image_url: string;
      image_url_small: string;
      image_url_cropped: string;
      frame_type: string | null;
      created_at: string;
    };
    return {
      id: r.id,
      name: r.name,
      type: r.type,
      desc: r.desc,
      race: r.race,
      attribute: r.attribute ?? undefined,
      atk: r.atk ?? undefined,
      def: r.def ?? undefined,
      level: r.level ?? undefined,
      scale: r.scale ?? undefined,
      linkval: r.linkval ?? undefined,
      linkmarkers: r.linkmarkers ?? undefined,
      archetype: r.archetype ?? undefined,
      imageUrl: r.image_url,
      imageUrlSmall: r.image_url_small,
      imageUrlCropped: r.image_url_cropped,
      frameType: r.frame_type ?? undefined,
      createdAt: r.created_at,
    };
  }
}
