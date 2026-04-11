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
             created_at, updated_at,
             CASE WHEN EXISTS (
               SELECT 1 FROM archetype_instances
               WHERE archetype_id = archetypes.id AND guide_type = 'COUNTER'
             ) THEN 1 ELSE 0 END as has_counter_guide,
             CASE WHEN EXISTS (
               SELECT 1 FROM archetype_instances
               WHERE archetype_id = archetypes.id AND guide_type = 'DECK'
             ) THEN 1 ELSE 0 END as has_deck_guide
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
             created_at, updated_at,
             CASE WHEN EXISTS (
               SELECT 1 FROM archetype_instances
               WHERE archetype_id = archetypes.id AND guide_type = 'COUNTER'
             ) THEN 1 ELSE 0 END as has_counter_guide,
             CASE WHEN EXISTS (
               SELECT 1 FROM archetype_instances
               WHERE archetype_id = archetypes.id AND guide_type = 'DECK'
             ) THEN 1 ELSE 0 END as has_deck_guide
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

  async findAllRegisteredArchetypes(sortBy: "recent" | "instances" = "recent", guideType?: 'COUNTER' | 'DECK'): Promise<Archetype[]> {
    let orderByClause: string;
    let whereClause = "WHERE a.registered = 1";
    
    // Add guide type filter if provided
    if (guideType) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM archetype_instances ai 
        WHERE ai.archetype_id = a.id AND ai.guide_type = '${guideType}'
      )`;
    }
    
    if (sortBy === "instances") {
      const guideTypeFilter = guideType ? `AND ai.guide_type = '${guideType}'` : '';
      orderByClause = `ORDER BY (
        SELECT COUNT(*)
        FROM archetype_instances ai
        WHERE ai.archetype_id = a.id ${guideTypeFilter}
      ) DESC`;
    } else {
      const guideTypeFilter = guideType ? `AND ai.guide_type = '${guideType}'` : '';
      orderByClause = `ORDER BY (
        SELECT MAX(ai.created_at)
        FROM archetype_instances ai
        WHERE ai.archetype_id = a.id ${guideTypeFilter}
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
      ${whereClause}
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

  async getGuidesGeneralStats(limit: number = 15, guideType?: 'COUNTER' | 'DECK'): Promise<GeneralStats> {
    // Get total registered archetypes (with guides of the specified type if provided)
    let totalArchetypesQuery = `
      SELECT COUNT(DISTINCT a.id) as count
      FROM archetypes a
      WHERE a.registered = 1
    `;
    
    if (guideType) {
      totalArchetypesQuery = `
        SELECT COUNT(DISTINCT a.id) as count
        FROM archetypes a
        INNER JOIN archetype_instances ai ON a.id = ai.archetype_id
        WHERE a.registered = 1 AND ai.guide_type = ?
      `;
    }

    const totalArchetypesStmt = this.db.prepare(totalArchetypesQuery);
    const totalArchetypesResult = (guideType 
      ? totalArchetypesStmt.get(guideType) 
      : totalArchetypesStmt.get()) as { count: number };
    const totalArchetypes = totalArchetypesResult.count;

    // Get total guides (archetype instances) filtered by type if provided
    let totalGuidesQuery = `
      SELECT COUNT(*) as count
      FROM archetype_instances
    `;
    
    if (guideType) {
      totalGuidesQuery += ` WHERE guide_type = ?`;
    }

    const totalGuidesStmt = this.db.prepare(totalGuidesQuery);
    const totalGuidesResult = (guideType 
      ? totalGuidesStmt.get(guideType) 
      : totalGuidesStmt.get()) as { count: number };
    const totalGuides = totalGuidesResult.count;

    // Get top archetypes by guide count (filtered by type if provided)
    let topArchetypesQuery = `
      SELECT 
        a.id,
        a.name,
        COUNT(ai.id) as guideCount
      FROM archetypes a
      INNER JOIN archetype_instances ai ON a.id = ai.archetype_id
      WHERE a.registered = 1
    `;
    
    if (guideType) {
      topArchetypesQuery += ` AND ai.guide_type = ?`;
    }
    
    topArchetypesQuery += `
      GROUP BY a.id, a.name
      ORDER BY guideCount DESC
      LIMIT ?
    `;

    const topArchetypesStmt = this.db.prepare(topArchetypesQuery);
    const topArchetypes = (guideType 
      ? topArchetypesStmt.all(guideType, limit) 
      : topArchetypesStmt.all(limit)) as Array<{
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