import Database from "better-sqlite3";
import {
  Archetype,
  ArchetypeCreateDTO,
  ArchetypeUpdateDTO,
} from "@/domain/Archetype";

export class ArchetypeRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Busca arquetipos por nombre (Case-Insensitive)
   */
  searchByName(searchTerm: string, limit: number = 50): Archetype[] {
    const stmt = this.db.prepare(`
      SELECT id, name, registered, pending_requests,
             created_at, updated_at
      FROM archetypes 
      WHERE LOWER(name) LIKE LOWER(?) 
      ORDER BY name 
      LIMIT ?
    `);

    return stmt.all(`%${searchTerm}%`, limit) as Archetype[];
  }

  /**
   * Busca arquetipos que comiencen con el término (autocomplete)
   */
  searchAutocomplete(searchTerm: string, limit: number = 10): Archetype[] {
    const stmt = this.db.prepare(`
      SELECT id, name, registered, pending_requests,
             created_at, updated_at
      FROM archetypes 
      WHERE LOWER(name) LIKE LOWER(?) 
      ORDER BY name 
      LIMIT ?
    `);

    return stmt.all(`${searchTerm}%`, limit) as Archetype[];
  }

  /**
   * Obtiene un arquetipo por su ID
   */
  findById(id: number): Archetype | null {
    const stmt = this.db.prepare(`
      SELECT id, name, registered, pending_requests,
             created_at, updated_at
      FROM archetypes 
      WHERE id = ?
    `);

    const result = stmt.get(id) as Archetype | undefined;
    return result || null;
  }

  /**
   * Obtiene un arquetipo por su nombre exacto
   */
  findByName(name: string): Archetype | null {
    const stmt = this.db.prepare(`
      SELECT id, name, registered, pending_requests,
             created_at, updated_at
      FROM archetypes 
      WHERE name = ?
    `);

    const result = stmt.get(name) as Archetype | undefined;
    return result || null;
  }

  /**
   * Obtiene todos los arquetipos (con paginación opcional)
   */
  findAll(limit?: number, offset?: number): Archetype[] {
    let sql = `
      SELECT id, name, registered, pending_requests,
             created_at, updated_at
      FROM archetypes 
      ORDER BY name
    `;

    if (limit !== undefined) {
      sql += ` LIMIT ${limit}`;
      if (offset !== undefined) {
        sql += ` OFFSET ${offset}`;
      }
    }

    const stmt = this.db.prepare(sql);
    return stmt.all() as Archetype[];
  }

  /**
   * Actualiza un arquetipo existente
   */
  update(id: number, archetypeData: ArchetypeUpdateDTO): Archetype | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (archetypeData.name !== undefined) {
      updates.push("name = ?");
      params.push(archetypeData.name);
    }

    if (archetypeData.registered !== undefined) {
      updates.push("registered = ?");
      params.push(archetypeData.registered ? 1 : 0);
    }

    if (archetypeData.pending_requests !== undefined) {
      updates.push("pending_requests = ?");
      params.push(archetypeData.pending_requests);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);

    const sql = `
      UPDATE archetypes 
      SET ${updates.join(", ")}
      WHERE id = ?
      RETURNING id, name, registered, pending_requests, created_at, updated_at
    `;

    const stmt = this.db.prepare(sql);
    const result = stmt.get(...params) as Archetype | undefined;

    return result || null;
  }

  /**
   * Marca un arquetipo como registrado (para tu funcionalidad principal)
   */
  markAsRegistered(id: number): Archetype | null {
    const stmt = this.db.prepare(`
      UPDATE archetypes 
      SET registered = 1, pending_requests = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING id, name, registered, pending_requests, created_at, updated_at
    `);

    const result = stmt.get(id) as Archetype | undefined;
    return result || null;
  }

  /**
   * Marca un arquetipo como no registrado
   */
  markAsUnregistered(id: number): Archetype | null {
    const stmt = this.db.prepare(`
      UPDATE archetypes 
      SET registered = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING id, name, registered, pending_requests, created_at, updated_at
    `);

    const result = stmt.get(id) as Archetype | undefined;
    return result || null;
  }

  /**
   * Incrementa el contador de solicitudes pendientes
   */
  incrementPendingRequests(id: number): Archetype | null {
    const stmt = this.db.prepare(`
      UPDATE archetypes 
      SET pending_requests = pending_requests + 1, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING id, name, registered, pending_requests, created_at, updated_at
    `);

    const result = stmt.get(id) as Archetype | undefined;
    return result || null;
  }

  /**
   * Decrementa el contador de solicitudes pendientes
   */
  decrementPendingRequests(id: number): Archetype | null {
    const stmt = this.db.prepare(`
      UPDATE archetypes 
      SET pending_requests = MAX(pending_requests - 1, 0), 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING id, name, registered, pending_requests, created_at, updated_at
    `);

    const result = stmt.get(id) as Archetype | undefined;
    return result || null;
  }

  /**
   * Resetea el contador de solicitudes pendientes a 0
   */
  resetPendingRequests(id: number): Archetype | null {
    const stmt = this.db.prepare(`
      UPDATE archetypes 
      SET pending_requests = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING id, name, registered, pending_requests, created_at, updated_at
    `);

    const result = stmt.get(id) as Archetype | undefined;
    return result || null;
  }

  /**
   * Obtiene arquetipos con solicitudes pendientes
   */
  findWithPendingRequests(limit?: number): Archetype[] {
    let sql = `
      SELECT id, name, registered, pending_requests,
             created_at, updated_at
      FROM archetypes 
      WHERE pending_requests > 0
      ORDER BY pending_requests DESC, updated_at DESC
    `;

    if (limit !== undefined) {
      sql += ` LIMIT ${limit}`;
    }

    const stmt = this.db.prepare(sql);
    return stmt.all() as Archetype[];
  }

  /**
   * Obtiene estadísticas de los arquetipos
   */
  getStatistics(): {
    total: number;
    registered: number;
    unregistered: number;
    pending_requests_total: number;
    archetypes_with_requests: number;
  } {
    const totalStmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM archetypes",
    );
    const registeredStmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM archetypes WHERE registered = 1",
    );
    const pendingTotalStmt = this.db.prepare(
      "SELECT SUM(pending_requests) as total FROM archetypes",
    );
    const withRequestsStmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM archetypes WHERE pending_requests > 0",
    );

    const total = totalStmt.get() as { count: number };
    const registered = registeredStmt.get() as { count: number };
    const pendingTotal = pendingTotalStmt.get() as { total: number | null };
    const withRequests = withRequestsStmt.get() as { count: number };

    return {
      total: total.count,
      registered: registered.count,
      unregistered: total.count - registered.count,
      pending_requests_total: pendingTotal.total || 0,
      archetypes_with_requests: withRequests.count,
    };
  }

  /**
   * Verifica si un arquetipo existe por nombre
   */
  existsByName(name: string): boolean {
    const stmt = this.db.prepare("SELECT 1 FROM archetypes WHERE name = ?");
    const result = stmt.get(name);
    return !!result;
  }
}
