import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";
import { Archetype, ArchetypeUpdateDTO } from "@/domain/Archetype";
import Database from "better-sqlite3";

export class SqliteArchetypeRepository implements ArchetypeRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async searchArchetypeByName(
    searchTerm: string,
    limit: number = 50,
  ): Promise<Archetype[]> {
    const stmt = this.db.prepare(`
      SELECT id, name, registered,
             created_at, updated_at
      FROM archetypes 
      WHERE LOWER(name) LIKE LOWER(?) 
      ORDER BY name 
      LIMIT ?
    `);

    return stmt.all(`%${searchTerm}%`, limit) as Archetype[];
  }

  async searchAutocomplete(
    searchTerm: string,
    limit: number = 10,
  ): Promise<Archetype[]> {
    const stmt = this.db.prepare(`
      SELECT id, name, registered,
             created_at, updated_at
      FROM archetypes 
      WHERE LOWER(name) LIKE LOWER(?) 
      ORDER BY name 
      LIMIT ?
    `);

    return stmt.all(`${searchTerm}%`, limit) as Archetype[];
  }

  async findArchetypeById(id: number): Promise<Archetype | null> {
    const stmt = this.db.prepare(`
      SELECT id, name, registered,
             created_at, updated_at
      FROM archetypes 
      WHERE id = ?
    `);

    const result = stmt.get(id) as Archetype | undefined;
    return result || null;
  }

  async findArchetypeByName(name: string): Promise<Archetype | null> {
    const stmt = this.db.prepare(`
      SELECT id, name, registered,
             created_at, updated_at
      FROM archetypes 
      WHERE name = ?
    `);

    const result = stmt.get(name) as Archetype | undefined;
    return result || null;
  }

  async findAllRegisteredArchetypes(): Promise<Archetype[]> {
    const stmt = this.db.prepare(`
      SELECT 
        a.id, 
        a.name, 
        a.registered, 
        a.created_at, 
        a.updated_at
      FROM archetypes a
      WHERE a.registered = 1
      ORDER BY (
        SELECT MAX(ai.created_at)
        FROM archetype_instances ai
        WHERE ai.archetype_id = a.id
      ) DESC
    `);

    return stmt.all() as Archetype[];
  }

  async updateExistingArchetype(
    id: number,
    archetypeData: ArchetypeUpdateDTO,
  ): Promise<Archetype | null> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (archetypeData.name !== undefined) {
      updates.push("name = ?");
      params.push(archetypeData.name);
    }

    if (archetypeData.registered !== undefined) {
      updates.push("registered = ?");
      params.push(archetypeData.registered ? 1 : 0);
    }

    if (updates.length === 0) {
      return this.findArchetypeById(id);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);

    const sql = `
      UPDATE archetypes 
      SET ${updates.join(", ")}
      WHERE id = ?
      RETURNING id, name, registered, created_at, updated_at
    `;

    const stmt = this.db.prepare(sql);
    const result = stmt.get(...params) as Archetype | undefined;

    return result || null;
  }
}
