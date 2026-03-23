import { ArchetypeRepository, GeneralStats } from "@/domain/ports/ArchetypeRepository.js";
import { Archetype, ArchetypeUpdateDTO } from "@/domain/Archetype.js";
import Database from "better-sqlite3";

export class SqliteArchetypeRepository implements ArchetypeRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async getTotalSearchCount(searchTerm: string): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM archetypes 
      WHERE LOWER(name) LIKE LOWER(?)
    `);
    
    const result = stmt.get(`%${searchTerm}%`) as { total: number };
    return result.total;
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

  async findAllRegisteredArchetypes(sortBy: "recent" | "instances" = "recent"): Promise<Archetype[]> {
    let orderByClause: string;
    
    if (sortBy === "instances") {
      orderByClause = `ORDER BY (
        SELECT COUNT(*)
        FROM archetype_instances ai
        WHERE ai.archetype_id = a.id
      ) DESC`;
    } else {
      orderByClause = `ORDER BY (
        SELECT MAX(ai.created_at)
        FROM archetype_instances ai
        WHERE ai.archetype_id = a.id
      ) DESC`;
    }

    const stmt = this.db.prepare(`
      SELECT 
        a.id, 
        a.name, 
        a.registered, 
        a.created_at, 
        a.updated_at
      FROM archetypes a
      WHERE a.registered = 1
      ${orderByClause}
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

  async getGuidesGeneralStats(limit: number = 15): Promise<GeneralStats> {
    // Get total registered archetypes
    const totalArchetypesStmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM archetypes
      WHERE registered = 1
    `);
    const totalArchetypesResult = totalArchetypesStmt.get() as { count: number };
    const totalArchetypes = totalArchetypesResult.count;

    // Get total guides (archetype instances)
    const totalGuidesStmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM archetype_instances
    `);
    const totalGuidesResult = totalGuidesStmt.get() as { count: number };
    const totalGuides = totalGuidesResult.count;

    // Get top archetypes by guide count
    const topArchetypesStmt = this.db.prepare(`
      SELECT 
        a.id,
        a.name,
        COUNT(ai.id) as guideCount
      FROM archetypes a
      INNER JOIN archetype_instances ai ON a.id = ai.archetype_id
      WHERE a.registered = 1
      GROUP BY a.id, a.name
      ORDER BY guideCount DESC
      LIMIT ?
    `);
    const topArchetypes = topArchetypesStmt.all(limit) as Array<{
      id: number;
      name: string;
      guideCount: number;
    }>;

    return {
      totalArchetypes,
      totalGuides,
      topArchetypes,
    };
  }
}