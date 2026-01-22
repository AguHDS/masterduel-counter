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
    // Cambiado a público
    // Tabla de arquetipos (la que ya necesitas)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS archetypes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        registered BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Todas las tablas inicializadas correctamente");
  }

  public getConnection(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }
}
