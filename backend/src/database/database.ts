import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DatabasePort {
  getConnection(): Database.Database;
  close(): void;
}

export class YugiohDatabase implements DatabasePort {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, "../data/database.db");
    this.db = new Database(dbPath);
    this.initializeAllTables();
  }

  public initializeAllTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS archetypes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        registered BOOLEAN DEFAULT FALSE,
        pending_requests INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public getConnection(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }
}

export const createYugiohDatabase = (): DatabasePort => {
  return new YugiohDatabase();
};

export type DatabaseConnection = Database.Database;
