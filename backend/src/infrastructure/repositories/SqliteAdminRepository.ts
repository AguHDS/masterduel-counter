import { AdminRepository } from "@/domain/ports/AdminRepository";
import { Admin } from "@/domain/Admin";
import Database from "better-sqlite3";

export class SqliteAdminRepository implements AdminRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async findByUsername(username: string): Promise<Admin | null> {
    const stmt = this.db.prepare(`
      SELECT id, username, password_hash, created_at
      FROM admins 
      WHERE username = ?
    `);

    const result = stmt.get(username) as Admin | undefined;
    return result || null;
  }
}
