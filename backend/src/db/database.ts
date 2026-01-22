import Database from "better-sqlite3";
import path from "path";

export class YugiohDatabase {
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
  }

  public getConnection(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }
}
