import Database from "better-sqlite3";
import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
} from "../../domain/ArchetypeInstance";
import { ArchetypeInstanceRepository } from "../../domain/ports/ArchetypeInstanceRepository";

export class SqliteArchetypeInstanceRepository implements ArchetypeInstanceRepository {
  constructor(private db: Database.Database) {}

  async create(data: ArchetypeInstanceCreateDTO): Promise<ArchetypeInstance> {
    const stmt = this.db.prepare(`
      INSERT INTO archetype_instances (archetype_id, user_id, title, header_card_id, general_tip, likes, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(data.archetypeId, data.userId, data.title, data.headerCardId, data.generalTip || null);

    return this.findById(result.lastInsertRowid as number) as Promise<ArchetypeInstance>;
  }

  async findById(id: number): Promise<ArchetypeInstance | null> {
    const stmt = this.db.prepare(`
      SELECT *
      FROM archetype_instances
      WHERE id = ?
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      likes: number;
      created_at: string;
      updated_at: string;
    }

    const row = stmt.get(id) as InstanceRow | undefined;
    if (!row) return null;

    return {
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      likes: row.likes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findByArchetypeId(archetypeId: number): Promise<ArchetypeInstanceWithDetails[]> {
    const stmt = this.db.prepare(`
      SELECT 
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        c.name as header_card_name,
        c.image_url as header_card_image_url
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      WHERE ai.archetype_id = ?
      ORDER BY ai.likes DESC, ai.updated_at DESC
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      likes: number;
      created_at: string;
      updated_at: string;
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(archetypeId) as InstanceRow[];

    return rows.map((row) => ({
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      likes: row.likes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async findByUserId(userId: string): Promise<ArchetypeInstanceWithDetails[]> {
    const stmt = this.db.prepare(`
      SELECT 
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        c.name as header_card_name,
        c.image_url as header_card_image_url
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      WHERE ai.user_id = ?
      ORDER BY ai.updated_at DESC
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      likes: number;
      created_at: string;
      updated_at: string;
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(userId) as InstanceRow[];

    return rows.map((row) => ({
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      likes: row.likes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async findByArchetypeAndUser(
    archetypeId: number,
    userId: string
  ): Promise<ArchetypeInstance | null> {
    const stmt = this.db.prepare(`
      SELECT *
      FROM archetype_instances
      WHERE archetype_id = ? AND user_id = ?
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      likes: number;
      created_at: string;
      updated_at: string;
    }

    const row = stmt.get(archetypeId, userId) as InstanceRow | undefined;
    if (!row) return null;

    return {
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      likes: row.likes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async update(id: number, data: ArchetypeInstanceUpdateDTO): Promise<ArchetypeInstance> {
    const updates: string[] = [];
    const values: (number | string | null)[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }

    if (data.headerCardId !== undefined) {
      updates.push("header_card_id = ?");
      values.push(data.headerCardId);
    }

    if (data.generalTip !== undefined) {
      updates.push("general_tip = ?");
      values.push(data.generalTip);
    }

    if (updates.length === 0) {
      return this.findById(id) as Promise<ArchetypeInstance>;
    }

    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE archetype_instances
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id) as Promise<ArchetypeInstance>;
  }

  async delete(id: number): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM archetype_instances
      WHERE id = ?
    `);

    stmt.run(id);
  }
}
